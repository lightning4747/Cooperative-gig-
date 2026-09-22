package org.cooperative.services.federation;

import static org.cooperative.services.common.Db.p;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;
import org.cooperative.services.common.*;
import org.cooperative.services.jobs.DispatchService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
  private final Db db;
  private final DispatchService dispatch;

  public AdminController(Db db, DispatchService dispatch) {
    this.db = db;
    this.dispatch = dispatch;
  }

  private UUID admin() {
    var a = Actor.current();
    a.require("ADMIN");
    return a.id();
  }

  public record Verification(
      @NotNull @Pattern(regexp = "ACTIVE|REJECTED|SUSPENDED") String status,
      @NotNull Set<UUID> verifiedCategoryIds,
      @NotBlank @Size(max = 1000) String note) {}

  public record Insurance(
      @NotNull @Pattern(regexp = "NOT_ENROLLED|PENDING|ENROLLED") String pmsbyStatus,
      @NotNull @Pattern(regexp = "NOT_ENROLLED|PENDING|ENROLLED") String pmjjbyStatus,
      @NotBlank @Size(max = 1000) String evidenceReference) {}

  public record Config(
      @Min(1) int version,
      @NotNull @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 3)
          BigDecimal proximityWeight,
      @NotNull @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 3)
          BigDecimal ratingWeight,
      @NotNull @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 3)
          BigDecimal loadWeight,
      @NotNull @DecimalMin("0") @DecimalMax("1") @Digits(integer = 1, fraction = 3)
          BigDecimal welfareRate,
      @NotNull @DecimalMin("0") @Digits(integer = 8, fraction = 2) BigDecimal emergencySurcharge,
      @Min(100) @Max(50000) int standardRadiusM,
      @Min(100) @Max(20000) int emergencyRadiusM,
      @Min(60) @Max(90) int emergencyTimeoutS) {}

  public record Price(
      @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal basePrice,
      boolean emergencySupported,
      boolean active) {}

  @GetMapping("/workers")
  public List<Map<String, Object>> workers(
      @RequestParam(required = false) UUID societyId,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") @Min(0) int page) {
    admin();
    return db.list(
        """
        SELECT w.user_id,u.name,u.phone,w.society_id,soc.name AS society_name,w.membership_id,w.uan_last4,w.certifications,w.verification_status,w.is_available,w.avg_rating,w.pmsby_status,w.pmjjby_status,w.location_updated_at,ST_Y(w.current_location::geometry) AS latitude,ST_X(w.current_location::geometry) AS longitude,
          (SELECT count(*) FROM job j WHERE j.worker_id=w.user_id AND j.status='COMPLETED') AS total_jobs_completed,
          (SELECT COALESCE(sum(we.amount),0) FROM welfare_entry we WHERE we.worker_id=w.user_id) AS welfare_balance,
          (SELECT count(*) FROM welfare_entry we WHERE we.worker_id=w.user_id) AS welfare_entries_count,
          (SELECT jsonb_agg(jsonb_build_object('categoryId',s.category_id,'verified',s.verified)) FROM worker_skill s WHERE s.worker_id=w.user_id) AS skills
        FROM worker w
        JOIN app_user u ON u.id=w.user_id
        LEFT JOIN society soc ON soc.id=w.society_id
        WHERE (CAST(:society AS uuid) IS NULL OR w.society_id=:society)
          AND (CAST(:status AS text) IS NULL OR w.verification_status=:status)
        ORDER BY u.created_at DESC,w.user_id LIMIT 100 OFFSET :offset
        """,
        p("society", societyId, "status", status, "offset", (long) page * 100));
  }

  @PutMapping("/workers/{id}/verification")
  @Transactional
  public void verify(@PathVariable UUID id, @Valid @RequestBody Verification b) {
    var actor = admin();
    db.one("SELECT user_id FROM worker WHERE user_id=:id FOR UPDATE", p("id", id));
    var verifiedCategories = new HashSet<>(b.verifiedCategoryIds());
    if (verifiedCategories.isEmpty() && b.status().equals("ACTIVE")) {
      var declared = db.list("SELECT category_id FROM worker_skill WHERE worker_id=:id", p("id", id));
      for (var row : declared) {
        verifiedCategories.add((UUID) row.get("categoryId"));
      }
    }
    if (b.status().equals("ACTIVE") && verifiedCategories.isEmpty())
      throw ApiException.bad("An active worker needs at least one verified skill");
    if (!verifiedCategories.isEmpty()
        && db.count(
                "SELECT count(*) FROM worker_skill WHERE worker_id=:id AND category_id IN (:skills)",
                p("id", id, "skills", verifiedCategories))
            != verifiedCategories.size())
      throw ApiException.bad("Only declared skills can be verified");
    db.update(
        "UPDATE worker SET verification_status=:status,verification_note=:note,is_available=CASE WHEN :status='ACTIVE' THEN is_available ELSE false END WHERE user_id=:id",
        p("id", id, "status", b.status(), "note", b.note()));
    db.update("UPDATE worker_skill SET verified=false WHERE worker_id=:id", p("id", id));
    if (!verifiedCategories.isEmpty())
      db.update(
          "UPDATE worker_skill SET verified=true WHERE worker_id=:id AND category_id IN (:skills)",
          p("id", id, "skills", verifiedCategories));
    db.audit(actor, "WORKER_VERIFICATION", id, b);
    dispatch.notify(id, "VERIFICATION_UPDATED", null);
  }

  @PutMapping("/workers/{id}/insurance")
  @Transactional
  public void insurance(@PathVariable UUID id, @Valid @RequestBody Insurance b) {
    var actor = admin();
    if (db.update(
            "UPDATE worker SET pmsby_status=:pmsby,pmjjby_status=:pmjjby WHERE user_id=:id",
            p("id", id, "pmsby", b.pmsbyStatus(), "pmjjby", b.pmjjbyStatus()))
        != 1) throw ApiException.notFound("Worker not found");
    db.audit(actor, "INSURANCE_STATUS_RECORDED", id, b);
  }

  @GetMapping("/config")
  public Map<String, Object> config() {
    admin();
    return db.one("SELECT * FROM allocation_config WHERE id=1", Map.of());
  }

  @PutMapping("/config")
  @Transactional
  public Map<String, Object> config(@Valid @RequestBody Config b) {
    var actor = admin();
    if (b.proximityWeight().add(b.ratingWeight()).add(b.loadWeight()).compareTo(BigDecimal.ONE)
        != 0) throw ApiException.bad("Allocation weights must sum to one");
    if (db.update(
            "UPDATE allocation_config SET version=version+1,proximity_weight=:pw,rating_weight=:rw,load_weight=:lw,welfare_rate=:welfare,emergency_surcharge=:extra,standard_radius_m=:standard,emergency_radius_m=:emergency,emergency_timeout_s=:timeout WHERE id=1 AND version=:version",
            p(
                "version",
                b.version(),
                "pw",
                b.proximityWeight(),
                "rw",
                b.ratingWeight(),
                "lw",
                b.loadWeight(),
                "welfare",
                b.welfareRate(),
                "extra",
                b.emergencySurcharge(),
                "standard",
                b.standardRadiusM(),
                "emergency",
                b.emergencyRadiusM(),
                "timeout",
                b.emergencyTimeoutS()))
        != 1) throw ApiException.conflict("Configuration changed; reload before saving");
    db.audit(actor, "CONFIG_UPDATED", 1, b);
    return config();
  }

  @PutMapping("/subservices/{id}/price")
  @Transactional
  public void price(@PathVariable UUID id, @Valid @RequestBody Price b) {
    var actor = admin();
    if (db.update(
            "UPDATE subservice SET base_price=:price,emergency_supported=:emergency,active=:active WHERE id=:id",
            p(
                "id",
                id,
                "price",
                b.basePrice(),
                "emergency",
                b.emergencySupported(),
                "active",
                b.active()))
        != 1) throw ApiException.notFound("Service not found");
    db.audit(actor, "SERVICE_PRICE_UPDATED", id, b);
  }

  @GetMapping("/metrics")
  public Map<String, Object> metrics(@RequestParam(required = false) UUID societyId) {
    admin();
    return p(
        "workers",
        db.one(
            "SELECT count(*) AS registered,count(*) FILTER(WHERE verification_status='ACTIVE') AS verified,count(*) FILTER(WHERE verification_status='PENDING_VERIFICATION') AS pending,count(*) FILTER(WHERE is_available AND verification_status='ACTIVE' AND location_updated_at>now()-interval '15 minutes') AS online,count(*) FILTER(WHERE is_available AND verification_status='ACTIVE' AND location_updated_at>now()-interval '15 minutes' AND NOT EXISTS(SELECT 1 FROM job b WHERE b.worker_id=worker.user_id AND b.status IN ('ACCEPTED','TRAVELLING','ARRIVED','IN_PROGRESS'))) AS available FROM worker WHERE CAST(:society AS uuid) IS NULL OR society_id=:society",
            p("society", societyId)),
        "jobs",
        db.list(
            "SELECT j.status,count(*) AS count FROM job j LEFT JOIN worker w ON w.user_id=j.worker_id WHERE CAST(:society AS uuid) IS NULL OR w.society_id=:society GROUP BY j.status",
            p("society", societyId)),
        "jobsToday",
        db.count(
            "SELECT count(*) FROM job j LEFT JOIN worker w ON w.user_id=j.worker_id WHERE j.created_at>=date_trunc('day',now()) AND (CAST(:society AS uuid) IS NULL OR w.society_id=:society)",
            p("society", societyId)),
        "money",
        db.one(
            "SELECT COALESCE(sum(p.gross_amount),0) AS gross,COALESCE(sum(p.worker_earning),0) AS worker_earnings,COALESCE(sum(p.welfare_contribution),0) AS welfare FROM payment p JOIN job j ON j.id=p.job_id JOIN worker w ON w.user_id=j.worker_id WHERE CAST(:society AS uuid) IS NULL OR w.society_id=:society",
            p("society", societyId)),
        "scope",
        societyId == null ? "FEDERATION_ALL" : "ASSIGNED_WORKERS_IN_SOCIETY",
        "currency",
        "INR");
  }

  @GetMapping("/unfulfilled")
  public List<Map<String, Object>> unfulfilled(@RequestParam(defaultValue = "0") @Min(0) int page) {
    admin();
    return db.list(
        "SELECT j.id,j.booking_type,j.area,j.formatted_address,j.created_at,j.retry_count,s.name AS service_name FROM job j JOIN subservice s ON s.id=j.subservice_id WHERE j.status='EXPIRED' ORDER BY j.created_at DESC LIMIT 100 OFFSET :offset",
        p("offset", (long) page * 100));
  }

  @GetMapping("/jobs/{id}/eligible-workers")
  public List<Map<String, Object>> eligibleWorkers(@PathVariable UUID id) {
    admin();
    var job = db.one("SELECT * FROM job WHERE id=:id", p("id", id));
    var candidates = dispatch.eligible(job, false);
    for (var c : candidates) {
      c.putAll(
          db.one(
              "SELECT u.name,u.phone,w.society_id FROM app_user u JOIN worker w ON w.user_id=u.id WHERE u.id=:id",
              p("id", c.get("userId"))));
    }
    return candidates;
  }

  @GetMapping("/jobs/{id}/allocation")
  public Map<String, Object> allocation(@PathVariable UUID id) {
    admin();
    return p(
        "offers",
        db.list(
            "SELECT * FROM job_offer WHERE job_id=:id ORDER BY score DESC,worker_id", p("id", id)),
        "manualDispatch",
        db.list("SELECT * FROM manual_dispatch WHERE job_id=:id ORDER BY created_at", p("id", id)),
        "history",
        db.list("SELECT * FROM job_history WHERE job_id=:id ORDER BY id", p("id", id)));
  }

  @GetMapping("/welfare")
  public List<Map<String, Object>> welfare(
      @RequestParam(required = false) UUID societyId,
      @RequestParam(defaultValue = "0") @Min(0) int page) {
    admin();
    return db.list(
        """
        SELECT e.id, e.worker_id, u.name AS worker_name, u.phone AS worker_phone, w.society_id, soc.name AS society_name,
               e.amount, e.created_at, p.job_id, s.name AS service_name, j.booking_type
        FROM welfare_entry e
        JOIN worker w ON w.user_id=e.worker_id
        JOIN app_user u ON u.id=e.worker_id
        LEFT JOIN society soc ON soc.id=w.society_id
        LEFT JOIN payment p ON p.id=e.payment_id
        LEFT JOIN job j ON j.id=p.job_id
        LEFT JOIN subservice s ON s.id=j.subservice_id
        WHERE CAST(:society AS uuid) IS NULL OR w.society_id=:society
        ORDER BY e.created_at DESC, e.id
        LIMIT 100 OFFSET :offset
        """,
        p("society", societyId, "offset", (long) page * 100));
  }

  @GetMapping("/audit")
  public List<Map<String, Object>> audit(@RequestParam(defaultValue = "0") @Min(0) long after) {
    admin();
    return db.list(
        "SELECT * FROM audit_log WHERE id>:after ORDER BY id LIMIT 100", p("after", after));
  }
}
