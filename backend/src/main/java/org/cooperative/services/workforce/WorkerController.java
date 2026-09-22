package org.cooperative.services.workforce;

import static org.cooperative.services.common.Db.p;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workers/me")
public class WorkerController {
  private final Db db;
  private final Crypto crypto;
  private final boolean dev;

  public WorkerController(Db db, Crypto crypto, @Value("${app.dev-auth}") boolean dev) {
    this.db = db;
    this.crypto = crypto;
    this.dev = dev;
  }

  public record Onboard(
      @NotNull UUID societyId,
      @NotBlank @Size(max = 80) String membershipId,
      String uan,
      @NotEmpty @Size(max = 10) Set<UUID> categoryIds,
      @NotNull @Size(max = 20) List<@NotBlank @Size(max = 200) String> certifications) {}

  public record Availability(boolean available) {}

  public record Location(
      @NotNull @DecimalMin("-90") @DecimalMax("90") Double latitude,
      @NotNull @DecimalMin("-180") @DecimalMax("180") Double longitude) {}

  private UUID worker() {
    var a = Actor.current();
    a.require("WORKER");
    return a.id();
  }

  @PostMapping("/onboarding")
  @Transactional
  public Map<String, Object> onboard(@Valid @RequestBody Onboard b) {
    var id = worker();
    if (db.count("SELECT count(*) FROM category WHERE id IN (:ids)", p("ids", b.categoryIds()))
        != b.categoryIds().size()) throw ApiException.bad("Unknown skill category");

    String rawUan = (b.uan() != null && b.uan().matches("[0-9]{12}")) ? b.uan() : "";
    boolean hasUan = !rawUan.isEmpty();
    String storedEncrypted = hasUan ? crypto.encrypt(rawUan) : "PENDING_ESHRAM";
    String storedFingerprint = hasUan ? crypto.hash(rawUan + (dev ? ":" + id : "")) : crypto.hash("NO_UAN:" + id);
    String storedLast4 = hasUan ? rawUan.substring(8) : "NONE";

    db.update(
        "INSERT INTO worker(user_id,society_id,membership_id,uan_encrypted,uan_fingerprint,uan_last4,certifications,verification_status,is_available,current_location,location_updated_at,avg_rating,pmsby_status,pmjjby_status) "
            + "VALUES (:id,:society,:member,:encrypted,:fingerprint,:last4,CAST(:certs AS jsonb),'PENDING_VERIFICATION',false,ST_SetSRID(ST_MakePoint(77.621,12.934),4326)::geography,now(),5.0,'NOT_ENROLLED','NOT_ENROLLED') "
            + "ON CONFLICT (user_id) DO UPDATE SET society_id=:society, membership_id=:member, uan_encrypted=:encrypted, uan_fingerprint=:fingerprint, uan_last4=:last4, certifications=CAST(:certs AS jsonb), verification_status='PENDING_VERIFICATION', is_available=false, current_location=ST_SetSRID(ST_MakePoint(77.621,12.934),4326)::geography, location_updated_at=now()",
        p(
            "id",
            id,
            "society",
            b.societyId(),
            "member",
            b.membershipId(),
            "encrypted",
            storedEncrypted,
            "fingerprint",
            storedFingerprint,
            "last4",
            storedLast4,
            "certs",
            db.json(b.certifications())));
    db.update("DELETE FROM worker_skill WHERE worker_id=:worker", p("worker", id));
    for (var category : b.categoryIds())
      db.update(
          "INSERT INTO worker_skill(worker_id,category_id,verified) VALUES (:worker,:category,false) ON CONFLICT (worker_id, category_id) DO UPDATE SET verified=false",
          p("worker", id, "category", category));

    db.audit(id, "WORKER_ONBOARDED", id, p("verification", "PENDING_VERIFICATION"));
    return profile();
  }

  @GetMapping
  public Map<String, Object> profile() {
    var id = worker();
    var result =
        db.one(
            "SELECT user_id,society_id,membership_id,uan_last4,certifications,verification_status,verification_note,is_available,avg_rating,pmsby_status,pmjjby_status,location_updated_at,ST_Y(current_location::geometry) AS latitude,ST_X(current_location::geometry) AS longitude FROM worker WHERE user_id=:id",
            p("id", id));
    result.put(
        "skills",
        db.list(
            "SELECT ws.category_id,c.name,ws.verified FROM worker_skill ws JOIN category c ON c.id=ws.category_id WHERE worker_id=:id",
            p("id", id)));
    return result;
  }

  @PatchMapping("/availability")
  public Map<String, Object> availability(@Valid @RequestBody Availability b) {
    if (db.update(
            "UPDATE worker SET is_available=:available WHERE user_id=:id AND verification_status='ACTIVE'",
            p("id", worker(), "available", b.available()))
        != 1) throw ApiException.conflict("Only verified active workers can change availability");
    return profile();
  }

  @PutMapping("/location")
  public void location(@Valid @RequestBody Location b) {
    if (db.update(
            "UPDATE worker SET current_location=ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography,location_updated_at=now() WHERE user_id=:id",
            p("id", worker(), "lat", b.latitude(), "lng", b.longitude()))
        != 1) throw ApiException.notFound("Complete onboarding first");
  }

  @GetMapping("/earnings")
  public Map<String, Object> earnings() {
    var id = worker();
    return p(
        "currency",
        "INR",
        "totals",
        db.one(
            "SELECT COALESCE(sum(p.worker_earning),0) AS total_earnings,COALESCE(sum(p.welfare_contribution),0) AS total_welfare,count(*) AS paid_jobs FROM payment p JOIN job j ON j.id=p.job_id WHERE j.worker_id=:id",
            p("id", id)),
        "recentPayments",
        db.list(
            "SELECT p.*, s.name AS subservice_name, j.booking_type FROM payment p JOIN job j ON j.id=p.job_id JOIN subservice s ON s.id=j.subservice_id WHERE j.worker_id=:id ORDER BY p.created_at DESC LIMIT 100",
            p("id", id)));
  }
}
