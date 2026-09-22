package org.cooperative.services.billing;

import static org.cooperative.services.common.Db.p;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.*;
import java.util.*;
import org.cooperative.services.common.*;
import org.cooperative.services.jobs.DispatchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class BillingController {
  private final Db db;
  private final DispatchService dispatch;
  private final boolean sandbox;

  public BillingController(
      Db db, DispatchService dispatch, @Value("${app.sandbox-payments}") boolean sandbox) {
    this.db = db;
    this.dispatch = dispatch;
    this.sandbox = sandbox;
  }

  @PostMapping("/jobs/{id}/payments/simulate")
  @Transactional
  public Map<String, Object> pay(@PathVariable UUID id) {
    var a = Actor.current();
    a.require("CUSTOMER");
    var j = dispatch.lock(id);
    if (!a.id().equals(j.get("customerId"))) throw ApiException.notFound("Job not found");
    if (!sandbox)
      throw new ApiException(
          503,
          "PAYMENTS_NOT_CONFIGURED",
          "Live payment integration is required; simulation is disabled");
    if (!List.of("ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS", "COMPLETED").contains(j.get("status")))
      throw ApiException.conflict("Payment requires an accepted or active job");
    var existing = db.optional("SELECT * FROM payment WHERE job_id=:id", p("id", id));
    if (existing.isPresent()) return existing.get();
    var base = (BigDecimal) j.get("basePrice");
    var gross = (BigDecimal) j.get("grossAmount");
    var surplus = gross.subtract(base);
    var welfare =
        surplus.multiply((BigDecimal) j.get("welfareRate")).setScale(2, RoundingMode.HALF_UP);
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
    db.audit(a.id(), "PAYMENT_SIMULATED", id, p("paymentId", payment));
    return db.one("SELECT * FROM payment WHERE id=:id", p("id", payment));
  }

  private void access(UUID id) {
    var j = db.one("SELECT customer_id,worker_id FROM job WHERE id=:id", p("id", id));
    var a = Actor.current();
    if (!a.admin() && !a.id().equals(j.get("customerId")) && !a.id().equals(j.get("workerId")))
      throw ApiException.notFound("Job not found");
  }

  @GetMapping("/jobs/{id}/invoice")
  public Map<String, Object> invoice(@PathVariable UUID id) {
    access(id);
    return db.one("SELECT * FROM invoice WHERE job_id=:id", p("id", id));
  }

  @GetMapping("/jobs/{id}/payment")
  public Map<String, Object> payment(@PathVariable UUID id) {
    access(id);
    return db.one("SELECT * FROM payment WHERE job_id=:id", p("id", id));
  }

  public record Rating(@Min(1) @Max(5) int stars, @Size(max = 2000) String feedback) {}

  @PostMapping("/jobs/{id}/rating")
  @Transactional
  public void rate(@PathVariable UUID id, @Valid @RequestBody Rating b) {
    var a = Actor.current();
    a.require("CUSTOMER");
    var j = dispatch.lock(id);
    if (!a.id().equals(j.get("customerId"))) throw ApiException.notFound("Job not found");
    if (!"COMPLETED".equals(j.get("status")))
      throw ApiException.conflict("Only completed jobs can be rated");
    db.one("SELECT user_id FROM worker WHERE user_id=:id FOR UPDATE", p("id", j.get("workerId")));
    db.update(
        "INSERT INTO rating(job_id,worker_id,stars,feedback) VALUES (:job,:worker,:stars,:feedback)",
        p("job", id, "worker", j.get("workerId"), "stars", b.stars(), "feedback", b.feedback()));
    db.update(
        "UPDATE worker SET avg_rating=(SELECT avg(stars) FROM rating WHERE worker_id=:worker) WHERE user_id=:worker",
        p("worker", j.get("workerId")));
  }
}
