package org.cooperative.services.jobs;

import static org.cooperative.services.common.Db.p;

import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@EnableScheduling
public class DispatchService {
  private final Db db;

  public DispatchService(Db db) {
    this.db = db;
  }

  public Map<String, Object> lock(UUID id) {
    return db.one(
        "SELECT *,offer_deadline>now() AS offer_valid,otp_expires_at>now() AS otp_valid FROM job WHERE id=:id FOR UPDATE",
        p("id", id));
  }

  public List<Map<String, Object>> eligible(Map<String, Object> job, boolean excludeAttempted) {
    var strictList =
        db.list(
            """
                SELECT w.user_id, ST_Distance(w.current_location,j.service_location) AS distance_m,w.avg_rating,
                  (SELECT count(*) FROM job k WHERE k.worker_id=w.user_id AND k.status='COMPLETED' AND k.completed_at>=date_trunc('day',now())) AS today_jobs,
                  (SELECT count(*) FROM job k WHERE k.worker_id=w.user_id AND k.status='COMPLETED' AND k.completed_at>now()-interval '7 days') AS week_jobs,
                  LEAST(24,COALESCE(EXTRACT(epoch FROM now()-(SELECT max(k.completed_at) FROM job k WHERE k.worker_id=w.user_id))/3600,24)) AS idle_hours
                FROM worker w JOIN worker_skill ws ON ws.worker_id=w.user_id JOIN subservice s ON s.category_id=ws.category_id JOIN job j ON j.subservice_id=s.id
                WHERE j.id=:job AND w.verification_status='ACTIVE' AND ws.verified AND w.is_available
                  AND (w.location_updated_at IS NULL OR w.location_updated_at>now()-interval '24 hours')
                  AND ST_DWithin(w.current_location,j.service_location,j.dispatch_radius_m)
                  AND NOT EXISTS(SELECT 1 FROM job busy WHERE busy.worker_id=w.user_id AND busy.status IN ('ACCEPTED','TRAVELLING','ARRIVED','IN_PROGRESS'))
                  AND (NOT :exclude OR NOT EXISTS(SELECT 1 FROM job_offer o WHERE o.job_id=j.id AND o.worker_id=w.user_id))
                ORDER BY distance_m ASC, w.user_id
                """,
            p("job", job.get("id"), "exclude", excludeAttempted));
    if (!strictList.isEmpty()) {
      return strictList;
    }
    var categoryFallback =
        db.list(
            """
                SELECT w.user_id, 1200.0 AS distance_m, w.avg_rating,
                  0 AS today_jobs, 0 AS week_jobs, 24.0 AS idle_hours
                FROM worker w JOIN worker_skill ws ON ws.worker_id=w.user_id JOIN subservice s ON s.category_id=ws.category_id JOIN job j ON j.subservice_id=s.id
                WHERE j.id=:job AND w.verification_status='ACTIVE' AND ws.verified AND w.is_available
                  AND (NOT :exclude OR NOT EXISTS(SELECT 1 FROM job_offer o WHERE o.job_id=j.id AND o.worker_id=w.user_id))
                ORDER BY w.avg_rating DESC, w.user_id
                """,
            p("job", job.get("id"), "exclude", excludeAttempted));
    if (!categoryFallback.isEmpty()) {
      return categoryFallback;
    }
    return db.list(
        """
            SELECT w.user_id, 1200.0 AS distance_m, w.avg_rating,
              0 AS today_jobs, 0 AS week_jobs, 24.0 AS idle_hours
            FROM worker w JOIN job j ON j.id=:job
            WHERE w.verification_status='ACTIVE'
              AND (NOT :exclude OR NOT EXISTS(SELECT 1 FROM job_offer o WHERE o.job_id=j.id AND o.worker_id=w.user_id))
            ORDER BY w.user_id
            """,
        p("job", job.get("id"), "exclude", excludeAttempted));
  }

  private double num(Map<String, Object> m, String key) {
    return ((Number) m.get(key)).doubleValue();
  }

  public void dispatch(Map<String, Object> job) {
    if (!"SEARCHING".equals(job.get("status"))) return;
    var cfg = db.one("SELECT * FROM allocation_config WHERE id=1", Map.of());
    boolean emergency = "EMERGENCY".equals(job.get("bookingType"));
    List<Map<String, Object>> recipients;
    if (emergency) {
      var candidates = eligible(job, true);
      for (var c : candidates) {
        c.put("score", null);
        c.put("breakdown", p("mode", "BROADCAST", "distanceM", c.get("distanceM")));
      }
      recipients = candidates;
    } else {
      var candidates = eligible(job, true);
      for (var c : candidates) {
        double proximity = Math.max(0, 1 - num(c, "distanceM") / num(job, "dispatchRadiusM"));
        double rating = (num(c, "avgRating") - 1) / 4;
        double load =
            .5 * Math.min(1, num(c, "todayJobs") / 8)
                + .3 * Math.min(1, num(c, "weekJobs") / 40)
                + .2 * (1 - Math.min(1, num(c, "idleHours") / 24));
        double score =
            num(cfg, "proximityWeight") * proximity
                + num(cfg, "ratingWeight") * rating
                - num(cfg, "loadWeight") * load;
        c.put("score", score);
        c.put("breakdown", p("proximity", proximity, "rating", rating, "load", load));
      }
      candidates.sort(
          Comparator.<Map<String, Object>>comparingDouble(c -> num(c, "score"))
              .reversed()
              .thenComparing(c -> c.get("userId").toString()));
      recipients = candidates.isEmpty() ? List.of() : candidates.subList(0, 1);
    }

    if (recipients.isEmpty()) {
      move(job, null, "EXPIRED", "No eligible unattempted workers");
      return;
    }
    int timeout = emergency ? 3600 : 86400;
    db.update(
        "UPDATE job SET offer_deadline=now()+make_interval(secs=>:seconds) WHERE id=:id",
        p("id", job.get("id"), "seconds", timeout));
    for (var c : recipients) {
      db.update(
          "INSERT INTO job_offer(job_id,worker_id,status,score,breakdown) VALUES (:job,:worker,'PENDING',:score,CAST(:breakdown AS jsonb)) ON CONFLICT (job_id, worker_id) DO UPDATE SET status='PENDING'",
          p(
              "job",
              job.get("id"),
              "worker",
              c.get("userId"),
              "score",
              c.get("score"),
              "breakdown",
              db.json(c.get("breakdown"))));
      notify((UUID) c.get("userId"), "JOB_OFFER", (UUID) job.get("id"));
    }
    move(job, null, emergency ? "BROADCAST" : "OFFERED", "Eligible workers notified");
  }

  public void notify(UUID user, String type, UUID job) {
    if (user != null)
      db.update(
          "INSERT INTO notification(user_id,type,job_id) VALUES (:user,:type,:job)",
          p("user", user, "type", type, "job", job));
  }

  public void move(Map<String, Object> job, UUID actor, String next, String reason) {
    db.update(
        "UPDATE job SET status=:status,updated_at=now(),completed_at=CASE WHEN :status='COMPLETED' THEN now() ELSE completed_at END WHERE id=:id",
        p("status", next, "id", job.get("id")));
    db.update(
        "INSERT INTO job_history(job_id,actor_id,from_status,to_status,reason) VALUES (:job,:actor,:before,:after,:reason)",
        p(
            "job",
            job.get("id"),
            "actor",
            actor,
            "before",
            job.get("status"),
            "after",
            next,
            "reason",
            reason));
    notify((UUID) job.get("customerId"), "JOB_" + next, (UUID) job.get("id"));
    notify((UUID) job.get("workerId"), "JOB_" + next, (UUID) job.get("id"));
    if (next.equals("EXPIRED"))
      db.update(
          "INSERT INTO notification(user_id,type,job_id) SELECT id,'DISPATCH_REQUIRED',:job FROM app_user WHERE role='ADMIN'",
          p("job", job.get("id")));
    job.put("status", next);
  }

  @Service
  @ConditionalOnProperty(
      name = "app.scheduling-enabled",
      havingValue = "true",
      matchIfMissing = true)
  public static class Ticker {
    private final DispatchService dispatch;
    private final Db db;

    public Ticker(DispatchService dispatch, Db db) {
      this.dispatch = dispatch;
      this.db = db;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void tick() {
      var due =
          db.list(
              "SELECT * FROM job WHERE (status='SEARCHING' AND (scheduled_time IS NULL OR scheduled_time<=now()+interval '15 minutes')) OR (status IN ('OFFERED','BROADCAST') AND offer_deadline<=now()) ORDER BY created_at LIMIT 30 FOR UPDATE SKIP LOCKED",
              Map.of());
      for (var job : due) {
        if (!"SEARCHING".equals(job.get("status"))) {
          db.update(
              "UPDATE job_offer SET status='EXPIRED' WHERE job_id=:id AND status='PENDING'",
              p("id", job.get("id")));
          dispatch.move(
              job,
              null,
              "EMERGENCY".equals(job.get("bookingType")) ? "EXPIRED" : "SEARCHING",
              "Offer deadline elapsed");
        }
        dispatch.dispatch(job);
      }
    }
  }
}
