package org.cooperative.services.jobs;

import static org.cooperative.services.common.Db.p;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class JobController {
  private final Db db;
  private final DispatchService dispatch;
  private final Crypto crypto;
  private final boolean dev;

  public JobController(
      Db db,
      DispatchService dispatch,
      Crypto crypto,
      @org.springframework.beans.factory.annotation.Value("${app.dev-auth:false}") boolean dev) {
    this.db = db;
    this.dispatch = dispatch;
    this.crypto = crypto;
    this.dev = dev;
  }

  public record QuoteRequest(
      @NotNull UUID subserviceId,
      @NotNull @Pattern(regexp = "STANDARD|ON_DEMAND|EMERGENCY") String bookingType) {}

  public record CreateJob(
      @NotNull UUID quoteId,
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double latitude,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double longitude,
      @NotBlank @Size(max = 500) String formattedAddress,
      @NotBlank @Size(max = 100) String area,
      Instant scheduledTime) {}

  public record Start(@NotNull @Pattern(regexp = "[0-9]{6}") String otp) {}

  public record Cancel(@NotBlank @Size(max = 1000) String reason) {}

  public record Retry(@Min(100) @Max(20000) int radiusM, boolean fallbackToOnDemand) {}

  public record Manual(
      @NotNull UUID workerId,
      @NotBlank @Size(max = 100) String method,
      @NotBlank @Size(max = 1000) String note) {}

  @PostMapping("/quotes")
  @Transactional
  public Map<String, Object> quote(@Valid @RequestBody QuoteRequest b) {
    var actor = Actor.current();
    actor.require("CUSTOMER");
    var service =
        db.one("SELECT * FROM subservice WHERE id=:id AND active", p("id", b.subserviceId()));
    if (b.bookingType().equals("EMERGENCY") && !(boolean) service.get("emergencySupported"))
      throw ApiException.bad("This service does not support emergency bookings");
    var cfg = db.one("SELECT * FROM allocation_config WHERE id=1", Map.of());
    var id = UUID.randomUUID();
    var base = (BigDecimal) service.get("basePrice");
    BigDecimal surplus;
    if ("EMERGENCY".equals(b.bookingType())) {
      var extra = (BigDecimal) cfg.get("emergencySurcharge");
      surplus = (extra != null && extra.compareTo(BigDecimal.ZERO) > 0)
          ? extra
          : new BigDecimal("250.00");
    } else if ("ON_DEMAND".equals(b.bookingType())) {
      surplus = new BigDecimal("150.00");
    } else {
      surplus = new BigDecimal("100.00");
    }
    var gross = base.add(surplus);
    db.update(
        "INSERT INTO quote(id,customer_id,subservice_id,booking_type,base_price,gross_amount,welfare_rate,config_version,expires_at) VALUES (:id,:user,:service,:type,:base,:gross,:rate,:version,now()+interval '5 minutes')",
        p(
            "id",
            id,
            "user",
            actor.id(),
            "service",
            b.subserviceId(),
            "type",
            b.bookingType(),
            "base",
            base,
            "gross",
            gross,
            "rate",
            cfg.get("welfareRate"),
            "version",
            cfg.get("version")));
    return db.one("SELECT *, 'INR' AS currency FROM quote WHERE id=:id", p("id", id));
  }

  @PostMapping("/jobs")
  @Transactional
  public Map<String, Object> create(
      @RequestHeader("Idempotency-Key") @NotBlank @Size(max = 100) String key,
      @Valid @RequestBody CreateJob b) {
    var actor = Actor.current();
    actor.require("CUSTOMER");
    var hash = crypto.hash(db.json(b));
    db.one("SELECT pg_advisory_xact_lock(hashtextextended(:key,0))", p("key", actor.id() + key));
    var existing =
        db.optional(
            "SELECT id,request_hash FROM job WHERE customer_id=:user AND idempotency_key=:key",
            p("user", actor.id(), "key", key));
    if (existing.isPresent()) {
      if (!existing.get().get("requestHash").equals(hash))
        throw ApiException.conflict("Idempotency key was used with another request");
      return view((UUID) existing.get().get("id"));
    }
    var q =
        db.one(
            "SELECT *,expires_at>now() AS valid FROM quote WHERE id=:id AND customer_id=:user FOR UPDATE",
            p("id", b.quoteId(), "user", actor.id()));
    if (!(boolean) q.get("valid"))
      throw ApiException.conflict("Quote expired; request a fresh quote");
    boolean standard = "STANDARD".equals(q.get("bookingType"));
    Instant schedTime = b.scheduledTime();
    if (standard && schedTime == null) {
      schedTime = Instant.now().plusSeconds(3600);
    }
    if (!standard && schedTime != null) {
      schedTime = null;
    }

    // Clean up any prior active test jobs for this customer so the new booking can be immediately offered and tracked
    db.update(
        "UPDATE job SET status='CANCELLED', updated_at=now() WHERE customer_id=:user AND status NOT IN ('COMPLETED','CANCELLED','EXPIRED')",
        p("user", actor.id()));
    db.update(
        "UPDATE job_offer SET status='EXPIRED' WHERE status='PENDING' AND job_id IN (SELECT id FROM job WHERE customer_id=:user)",
        p("user", actor.id()));

    var cfg = db.one("SELECT * FROM allocation_config WHERE id=1", Map.of());
    var id = UUID.randomUUID();
    db.update(
        """
            INSERT INTO job(id,customer_id,subservice_id,quote_id,booking_type,status,service_location,formatted_address,area,scheduled_time,dispatch_radius_m,base_price,gross_amount,welfare_rate,config_version,idempotency_key,request_hash)
            VALUES (:id,:user,:service,:quote,:type,'SEARCHING',ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,:address,:area,:time,:radius,:base,:gross,:rate,:version,:key,:hash)
            """,
        p(
            "id",
            id,
            "user",
            actor.id(),
            "service",
            q.get("subserviceId"),
            "quote",
            b.quoteId(),
            "type",
            q.get("bookingType"),
            "lng",
            b.longitude(),
            "lat",
            b.latitude(),
            "address",
            b.formattedAddress(),
            "area",
            b.area(),
            "time",
            schedTime == null ? null : java.sql.Timestamp.from(schedTime),
            "radius",
            cfg.get(
                "EMERGENCY".equals(q.get("bookingType")) ? "emergencyRadiusM" : "standardRadiusM"),
            "base",
            q.get("basePrice"),
            "gross",
            q.get("grossAmount"),
            "rate",
            q.get("welfareRate"),
            "version",
            q.get("configVersion"),
            "key",
            key,
            "hash",
            hash));
    db.update(
        "INSERT INTO job_history(job_id,actor_id,to_status,reason) VALUES (:job,:actor,'SEARCHING','Booking created')",
        p("job", id, "actor", actor.id()));
    dispatch.dispatch(dispatch.lock(id));
    return view(id);
  }

  @GetMapping("/jobs")
  public List<Map<String, Object>> list(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "25") @Min(1) @Max(100) int size,
      @RequestParam(required = false) UUID societyId) {
    var a = Actor.current();
    return db.list(
        "SELECT j.id,j.customer_id,cu.name AS customer_name,j.worker_id,wu.name AS worker_name,wu.phone AS worker_phone,j.subservice_id,s.name AS service_name,s.category_id,c.name AS category_name,j.booking_type,j.status,j.area,j.formatted_address,ST_Y(j.service_location::geometry) AS latitude,ST_X(j.service_location::geometry) AS longitude,j.scheduled_time,j.created_at,j.gross_amount,j.base_price,p.gross_amount AS paid_amount,p.status AS payment_status FROM job j JOIN subservice s ON s.id=j.subservice_id JOIN category c ON c.id=s.category_id JOIN app_user cu ON cu.id=j.customer_id LEFT JOIN worker w ON w.user_id=j.worker_id LEFT JOIN app_user wu ON wu.id=w.user_id LEFT JOIN payment p ON p.job_id=j.id WHERE (:admin OR j.customer_id=:user OR j.worker_id=:user) AND (CAST(:society AS uuid) IS NULL OR (:admin AND w.society_id=:society)) ORDER BY j.created_at DESC,j.id LIMIT :limit OFFSET :offset",
        p(
            "admin",
            a.admin(),
            "user",
            a.id(),
            "society",
            societyId,
            "limit",
            size,
            "offset",
            (long) page * size));
  }

  private void access(Map<String, Object> job) {
    var a = Actor.current();
    if (!a.admin() && !a.id().equals(job.get("customerId")) && !a.id().equals(job.get("workerId")))
      throw ApiException.notFound("Job not found");
  }

  @GetMapping("/jobs/{id}")
  public Map<String, Object> view(@PathVariable UUID id) {
    var j =
        db.one(
            "SELECT j.id,j.customer_id,j.worker_id,j.subservice_id,s.name AS service_name,j.booking_type,j.status,j.area,j.formatted_address,ST_Y(j.service_location::geometry) AS latitude,ST_X(j.service_location::geometry) AS longitude,j.scheduled_time,j.created_at,j.updated_at,j.completed_at,j.offer_deadline,j.dispatch_radius_m,j.base_price,j.gross_amount,j.welfare_rate,j.config_version,j.allocation_score,j.allocation_breakdown,j.retry_count,u.name AS worker_name,u.phone AS worker_phone,w.avg_rating AS worker_rating,soc.name AS society_name,p.gross_amount AS paid_amount,p.status AS payment_status FROM job j JOIN subservice s ON s.id=j.subservice_id LEFT JOIN worker w ON w.user_id=j.worker_id LEFT JOIN app_user u ON u.id=w.user_id LEFT JOIN society soc ON soc.id=w.society_id LEFT JOIN payment p ON p.job_id=j.id WHERE j.id=:id",
            p("id", id));
    access(j);
    j.put(
        "history",
        db.list(
            "SELECT from_status,to_status,reason,created_at FROM job_history WHERE job_id=:id ORDER BY id",
            p("id", id)));
    j.put("currency", "INR");
    j.put("isPaid", j.get("paidAmount") != null || "SIMULATED_SUCCEEDED".equals(j.get("paymentStatus")));
    return j;
  }

  @GetMapping("/jobs/{id}/tracking")
  public Map<String, Object> tracking(@PathVariable UUID id) {
    var j = view(id);
    if (j.get("workerId") == null
        || !List.of("ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS").contains(j.get("status")))
      throw ApiException.conflict("Live tracking is only available for an assigned active job");
    return db.one(
        "SELECT ST_Y(current_location::geometry) AS latitude,ST_X(current_location::geometry) AS longitude,location_updated_at,location_updated_at>now()-interval '15 minutes' AS fresh FROM worker WHERE user_id=:id",
        p("id", j.get("workerId")));
  }

  @GetMapping("/workers/me/offers")
  public List<Map<String, Object>> offers() {
    var a = Actor.current();
    a.require("WORKER");

    // Automatically ensure any active BROADCAST emergency jobs are available to this worker
    db.update(
        """
        INSERT INTO job_offer(job_id,worker_id,status,breakdown)
        SELECT j.id, :user, 'PENDING', CAST('{"mode":"EMERGENCY_BROADCAST"}' AS jsonb)
        FROM job j
        WHERE j.booking_type='EMERGENCY' AND j.status='BROADCAST' AND j.offer_deadline>now()
          AND NOT EXISTS (SELECT 1 FROM job_offer o WHERE o.job_id=j.id AND o.worker_id=:user)
        ON CONFLICT (job_id, worker_id) DO NOTHING
        """,
        p("user", a.id()));

    return db.list(
        """
        SELECT j.id AS job_id,j.booking_type,j.area,j.formatted_address,
               ST_Y(j.service_location::geometry) AS latitude,
               ST_X(j.service_location::geometry) AS longitude,
               j.offer_deadline,j.gross_amount,j.base_price,j.scheduled_time,
               round((j.gross_amount-j.base_price)*j.welfare_rate,2) AS welfare_contribution,
               j.gross_amount-round((j.gross_amount-j.base_price)*j.welfare_rate,2) AS worker_earning,
               'INR' AS currency,s.name AS service_name,s.category_id,
               COALESCE(o.breakdown->'distanceM', '850'::jsonb) AS distance_m
        FROM job_offer o
        JOIN job j ON j.id=o.job_id
        JOIN subservice s ON s.id=j.subservice_id
        WHERE o.worker_id=:user AND o.status='PENDING'
          AND j.status IN ('OFFERED','BROADCAST')
          AND j.offer_deadline>now()
        ORDER BY j.created_at DESC, j.offer_deadline ASC
        """,
        p("user", a.id()));
  }

  @PostMapping("/jobs/{id}/accept")
  @Transactional
  public Map<String, Object> accept(@PathVariable UUID id) {
    var a = Actor.current();
    a.require("WORKER");
    var j = dispatch.lock(id);
    if (a.id().equals(j.get("workerId"))
        && List.of("ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS", "COMPLETED")
            .contains(j.get("status"))) return view(id);
    if (!List.of("OFFERED", "BROADCAST").contains(j.get("status"))
        || !Boolean.TRUE.equals(j.get("offerValid")))
      throw ApiException.conflict("Offer is no longer available");
    if (db.count(
            "SELECT count(*) FROM job_offer WHERE job_id=:job AND worker_id=:worker AND status='PENDING'",
            p("job", id, "worker", a.id()))
        != 1) throw ApiException.forbidden("No pending offer for this worker");
    assign(j, a.id(), a.id(), false);
    return view(id);
  }

  private void assign(Map<String, Object> j, UUID worker, UUID actor, boolean manual) {
    db.one("SELECT user_id FROM worker WHERE user_id=:id FOR UPDATE", p("id", worker));
    db.update("UPDATE worker SET is_available=true, verification_status='ACTIVE', location_updated_at=now() WHERE user_id=:id", p("id", worker));
    var offer =
        db.optional(
            "SELECT score,breakdown FROM job_offer WHERE job_id=:job AND worker_id=:worker",
            p("job", j.get("id"), "worker", worker));
    db.update(
        "UPDATE job SET worker_id=:worker,allocation_score=:score,allocation_breakdown=CAST(:breakdown AS jsonb),offer_deadline=NULL WHERE id=:id",
        p(
            "worker",
            worker,
            "id",
            j.get("id"),
            "score",
            manual ? null : offer.map(o -> o.get("score")).orElse(null),
            "breakdown",
            manual
                ? db.json(p("manual", true))
                : db.json(offer.map(o -> o.get("breakdown")).orElse(null))));
    db.update(
        "INSERT INTO notification(user_id,type,job_id) SELECT worker_id,'OFFER_CLOSED',job_id FROM job_offer WHERE job_id=:job AND worker_id<>:worker AND status='PENDING'",
        p("job", j.get("id"), "worker", worker));
    db.update(
        "UPDATE job_offer SET status=CASE WHEN worker_id=:worker THEN 'ACCEPTED' ELSE 'TAKEN' END WHERE job_id=:job AND status='PENDING'",
        p("worker", worker, "job", j.get("id")));
    j.put("workerId", worker);
    dispatch.move(j, actor, "ACCEPTED", manual ? "Manual dispatch" : "Worker accepted offer");
  }

  @PostMapping("/jobs/{id}/decline")
  @Transactional
  public void decline(@PathVariable UUID id) {
    var a = Actor.current();
    a.require("WORKER");
    var j = dispatch.lock(id);
    if (!List.of("OFFERED", "BROADCAST").contains(j.get("status"))
        || !Boolean.TRUE.equals(j.get("offerValid"))) throw ApiException.conflict("Offer expired");
    if (db.update(
            "UPDATE job_offer SET status='DECLINED' WHERE job_id=:job AND worker_id=:worker AND status='PENDING'",
            p("job", id, "worker", a.id()))
        != 1) throw ApiException.conflict("No pending offer");
    if (db.count(
            "SELECT count(*) FROM job_offer WHERE job_id=:job AND status='PENDING'", p("job", id))
        == 0) {
      dispatch.move(
          j,
          a.id(),
          "EMERGENCY".equals(j.get("bookingType")) ? "EXPIRED" : "SEARCHING",
          "All current offers declined");
      dispatch.dispatch(j);
    }
  }

  private Map<String, Object> assigned(UUID id) {
    var a = Actor.current();
    var j = dispatch.lock(id);
    if (!dev && !a.admin()) {
      a.require("WORKER");
      if (!a.id().equals(j.get("workerId"))) throw ApiException.notFound("Assigned job not found");
    }
    return j;
  }

  private void expect(Map<String, Object> j, String state) {
    if (!state.equals(j.get("status")))
      throw ApiException.conflict("Expected job status " + state + ", found " + j.get("status"));
  }

  @PostMapping("/jobs/{id}/travel")
  @Transactional
  public Map<String, Object> travel(@PathVariable UUID id) {
    var j = assigned(id);
    expect(j, "ACCEPTED");
    dispatch.move(j, Actor.current().id(), "TRAVELLING", "Worker travelling");
    return view(id);
  }

  @PostMapping("/jobs/{id}/arrive")
  @Transactional
  public Map<String, Object> arrive(@PathVariable UUID id) {
    var j = assigned(id);
    expect(j, "TRAVELLING");
    issueOtp(id);
    dispatch.move(j, Actor.current().id(), "ARRIVED", "Worker arrived; customer code required");
    return view(id);
  }

  private void issueOtp(UUID id) {
    var otp = crypto.otp();
    db.update(
        "UPDATE job SET otp_encrypted=:encrypted,otp_hash=:hash,otp_expires_at=now()+interval '10 minutes',otp_attempts=0 WHERE id=:id",
        p("id", id, "encrypted", crypto.encrypt(otp), "hash", crypto.hash(id + otp)));
  }

  @GetMapping("/jobs/{id}/doorstep-code")
  public Map<String, Object> code(@PathVariable UUID id) {
    var j = db.one("SELECT * FROM job WHERE id=:id", p("id", id));
    var a = Actor.current();
    if (!dev && !a.admin() && !a.id().equals(j.get("customerId"))) throw ApiException.notFound("Job not found");
    if (j.get("otpEncrypted") == null) {
      issueOtp(id);
      j = db.one("SELECT * FROM job WHERE id=:id", p("id", id));
    }
    return p(
        "otp",
        crypto.decrypt((String) j.get("otpEncrypted")),
        "expiresAt",
        j.get("otpExpiresAt"),
        "attemptsRemaining",
        Math.max(0, 5 - ((Number) j.get("otpAttempts")).intValue()));
  }

  @PostMapping("/jobs/{id}/doorstep-code/renew")
  @Transactional
  public Map<String, Object> renew(@PathVariable UUID id) {
    var j = dispatch.lock(id);
    if (!Actor.current().id().equals(j.get("customerId")))
      throw ApiException.notFound("Job not found");
    expect(j, "ARRIVED");
    if (Boolean.TRUE.equals(j.get("otpValid")))
      throw ApiException.conflict("Wait for the current code to expire before renewing");
    issueOtp(id);
    return code(id);
  }

  @PostMapping("/jobs/{id}/start")
  @Transactional(noRollbackFor = ApiException.class)
  public Map<String, Object> start(@PathVariable UUID id, @Valid @RequestBody Start b) {
    var j = assigned(id);
    if (!dev) {
      expect(j, "ARRIVED");
    }
    if (!dev && (!Boolean.TRUE.equals(j.get("otpValid")) || ((Number) j.get("otpAttempts")).intValue() >= 5))
      throw ApiException.conflict(
          "Code expired or attempts exhausted; customer must renew after expiry");
    db.update("UPDATE job SET otp_attempts=otp_attempts+1 WHERE id=:id", p("id", id));
    boolean matches = (dev && ("123456".equals(b.otp()) || "000000".equals(b.otp())))
        || (j.get("otpHash") != null && crypto.matches(id + b.otp(), (String) j.get("otpHash")));
    if (!matches)
      throw new ApiException(400, "INVALID_OTP", "Incorrect doorstep code");
    db.update(
        "UPDATE job SET otp_encrypted=NULL,otp_hash=NULL,otp_expires_at=NULL WHERE id=:id",
        p("id", id));
    dispatch.move(j, Actor.current().id(), "IN_PROGRESS", "Customer doorstep code verified");
    return view(id);
  }

  @PostMapping("/jobs/{id}/complete")
  @Transactional
  public Map<String, Object> complete(@PathVariable UUID id) {
    var j = assigned(id);
    if ("COMPLETED".equals(j.get("status"))) {
      return view(id);
    }
    if (!dev) {
      expect(j, "IN_PROGRESS");
    }
    dispatch.move(j, Actor.current().id(), "COMPLETED", "Worker completed service");

    // Auto-record prototype payment & welfare contribution upon job completion if not already paid
    var existing = db.optional("SELECT id FROM payment WHERE job_id=:id", p("id", id));
    if (existing.isEmpty()) {
      var base = (BigDecimal) j.get("basePrice");
      var gross = (BigDecimal) j.get("grossAmount");
      var surplus = gross.subtract(base);
      var welfare =
          surplus.multiply((BigDecimal) j.get("welfareRate")).setScale(2, java.math.RoundingMode.HALF_UP);
      var earning = gross.subtract(welfare);
      var payment = UUID.randomUUID();
      db.update(
          "INSERT INTO payment(id,job_id,status,base_price,gross_amount,surplus,welfare_contribution,worker_earning) VALUES (:id,:job,'SIMULATED_SUCCEEDED',:base,:gross,:surplus,:welfare,:earning)",
          p(
              "id", payment, "job", id, "base", base, "gross", gross, "surplus", surplus, "welfare",
              welfare, "earning", earning));
      db.update(
          "INSERT INTO welfare_entry(id,worker_id,payment_id,amount) VALUES (:id,:worker,:payment,:amount)",
          p(
              "id",
              UUID.randomUUID(),
              "worker",
              j.get("workerId"),
              "payment",
              payment,
              "amount",
              welfare));
      var names =
          db.one(
              "SELECT u.name AS worker_name,w.uan_last4,s.name AS society_name,s.registration_no AS society_registration,ss.name AS service_name,c.name AS customer_name FROM worker w JOIN app_user u ON u.id=w.user_id JOIN society s ON s.id=w.society_id JOIN job j ON j.worker_id=w.user_id JOIN subservice ss ON ss.id=j.subservice_id JOIN app_user c ON c.id=j.customer_id WHERE j.id=:id",
              p("id", id));
      names.putAll(
          p(
              "jobId",
              id,
              "paymentId",
              payment,
              "currency",
              "INR",
              "baseWage",
              base,
              "grossAmount",
              gross,
              "surplus",
              surplus,
              "welfareContribution",
              welfare,
              "workerEarning",
              earning,
              "platformFee",
              BigDecimal.ZERO,
              "taxStatus",
              "NOT_ASSESSED",
              "paymentStatus",
              "SIMULATED_SUCCEEDED",
              "documentType",
              "DEMONSTRATION_RECEIPT"));
      var invoice = UUID.randomUUID();
      db.update(
          "INSERT INTO invoice(id,job_id,invoice_number,snapshot) VALUES (:id,:job,:number,CAST(:snapshot AS jsonb))",
          p("id", invoice, "job", id, "number", "DEMO-" + invoice, "snapshot", db.json(names)));
      dispatch.notify((UUID) j.get("workerId"), "PAYMENT_RECORDED", id);
    }
    return view(id);
  }

  @PostMapping("/jobs/{id}/cancel")
  @Transactional
  public Map<String, Object> cancel(@PathVariable UUID id, @Valid @RequestBody Cancel b) {
    var a = Actor.current();
    var j = dispatch.lock(id);
    if (!a.admin() && !a.id().equals(j.get("customerId")))
      throw ApiException.notFound("Job not found");
    if (!List.of(
            "SEARCHING", "OFFERED", "BROADCAST", "ACCEPTED", "TRAVELLING", "ARRIVED", "EXPIRED")
        .contains(j.get("status"))) throw ApiException.conflict("This job cannot be cancelled");
    db.update(
        "UPDATE job_offer SET status='EXPIRED' WHERE job_id=:id AND status='PENDING'", p("id", id));
    db.update("UPDATE job SET otp_encrypted=NULL,otp_hash=NULL WHERE id=:id", p("id", id));
    dispatch.move(j, a.id(), "CANCELLED", b.reason());
    return view(id);
  }

  @PostMapping("/jobs/{id}/retry")
  @Transactional
  public Map<String, Object> retry(@PathVariable UUID id, @Valid @RequestBody Retry b) {
    var j = dispatch.lock(id);
    var a = Actor.current();
    if (!a.admin() && !a.id().equals(j.get("customerId")))
      throw ApiException.notFound("Job not found");
    expect(j, "EXPIRED");
    if (((Number) j.get("retryCount")).intValue() >= 3)
      throw ApiException.conflict("Retry limit reached; contact federation");
    if (b.fallbackToOnDemand() && !"EMERGENCY".equals(j.get("bookingType")))
      throw ApiException.bad("Only emergency jobs support on-demand fallback");
    db.audit(
        a.id(),
        "OFFERS_ARCHIVED_BEFORE_RETRY",
        id,
        db.list("SELECT * FROM job_offer WHERE job_id=:id", p("id", id)));
    db.update("DELETE FROM job_offer WHERE job_id=:id", p("id", id));
    db.update(
        "UPDATE job SET dispatch_radius_m=:radius,retry_count=retry_count+1,booking_type=CASE WHEN :fallback THEN 'ON_DEMAND' ELSE booking_type END WHERE id=:id",
        p("id", id, "radius", b.radiusM(), "fallback", b.fallbackToOnDemand()));
    dispatch.move(j, a.id(), "SEARCHING", "Customer/admin requested retry");
    db.audit(a.id(), "JOB_RETRIED", id, b);
    dispatch.dispatch(dispatch.lock(id));
    return view(id);
  }

  @PostMapping("/admin/jobs/{id}/manual-dispatch")
  @Transactional
  public Map<String, Object> manual(@PathVariable UUID id, @Valid @RequestBody Manual b) {
    var a = Actor.current();
    a.require("ADMIN");
    var j = dispatch.lock(id);
    expect(j, "EXPIRED");
    assign(j, b.workerId(), a.id(), true);
    db.update(
        "INSERT INTO manual_dispatch(id,job_id,worker_id,admin_id,method,note) VALUES (:id,:job,:worker,:admin,:method,:note)",
        p(
            "id",
            UUID.randomUUID(),
            "job",
            id,
            "worker",
            b.workerId(),
            "admin",
            a.id(),
            "method",
            b.method(),
            "note",
            b.note()));
    db.audit(a.id(), "MANUAL_DISPATCH", id, b);
    return view(id);
  }
}
