package org.cooperative.services;

import static org.assertj.core.api.Assertions.*;
import static org.cooperative.services.common.Db.p;

import com.fasterxml.jackson.databind.*;
import java.util.*;
import java.util.concurrent.*;
import org.cooperative.services.common.Db;
import org.cooperative.services.jobs.DispatchService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.utility.DockerImageName;

@Testcontainers
@SpringBootTest(
    properties = {
      "app.dev-auth=true",
      "app.sandbox-payments=true",
      "app.scheduling-enabled=false",
      "app.bootstrap-admin-phone=",
      "app.jwt-secret=test-jwt-secret-with-at-least-thirty-two-bytes",
      "app.encryption-key=ZGV2ZWxvcG1lbnQta2V5LTMyLWJ5dGVzLWxvbmcxMjM="
    })
@AutoConfigureMockMvc
class BackendIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>(
          DockerImageName.parse("postgis/postgis:16-3.5").asCompatibleSubstituteFor("postgres"));

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", postgres::getJdbcUrl);
    r.add("spring.datasource.username", postgres::getUsername);
    r.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired Db db;
  @Autowired DispatchService dispatch;
  @Autowired TransactionTemplate tx;
  String customer, admin;
  UUID category, service;
  int serial;

  @BeforeEach
  void setup() throws Exception {
    db.update("TRUNCATE app_user, auth_challenge CASCADE", Map.of());
    db.update(
        "UPDATE allocation_config SET version=1,proximity_weight=.5,rating_weight=.3,load_weight=.2,welfare_rate=.5,emergency_surcharge=0,standard_radius_m=10000,emergency_radius_m=5000,emergency_timeout_s=60",
        Map.of());
    category =
        (UUID)
            db.one("SELECT category_id FROM subservice WHERE name='Pipe burst'", Map.of())
                .get("categoryId");
    service =
        (UUID) db.one("SELECT id FROM subservice WHERE name='Pipe burst'", Map.of()).get("id");
    db.update(
        "INSERT INTO app_user(id,phone,role,name) VALUES (:id,'+919999999999','ADMIN','Admin')",
        p("id", UUID.randomUUID()));
    admin = login("+919999999999", "CUSTOMER").path("accessToken").asText();
    customer = login("+919000000001", "CUSTOMER").path("accessToken").asText();
    serial = 1;
  }

  JsonNode login(String phone, String role) throws Exception {
    var c = call("POST", "/auth/challenges", null, p("phone", phone), 200);
    return call(
        "POST",
        "/auth/verify",
        null,
        p(
            "challengeId",
            c.path("challengeId").asText(),
            "code",
            c.path("devCode").asText(),
            "role",
            role,
            "name",
            "Test person"),
        200);
  }

  JsonNode call(String method, String path, String token, Object body, int status)
      throws Exception {
    return call(method, path, token, body, status, null);
  }

  JsonNode call(String method, String path, String token, Object body, int status, String key)
      throws Exception {
    var req =
        MockMvcRequestBuilders.request(
                org.springframework.http.HttpMethod.valueOf(method), "/api/v1" + path)
            .contentType(MediaType.APPLICATION_JSON);
    if (token != null) req.header("Authorization", "Bearer " + token);
    if (body != null) req.content(json.writeValueAsBytes(body));
    if (key != null) req.header("Idempotency-Key", key);
    var response = mvc.perform(req).andReturn().getResponse();
    assertThat(response.getStatus())
        .as(method + " " + path + ": " + response.getContentAsString())
        .isEqualTo(status);
    return response.getContentAsString().isBlank()
        ? json.nullNode()
        : json.readTree(response.getContentAsByteArray());
  }

  record Worker(UUID id, String token) {}

  Worker worker(boolean verify, double lat, double lng) throws Exception {
    int n = ++serial;
    var session = login("+91800000" + String.format("%04d", n), "WORKER");
    var token = session.path("accessToken").asText();
    var id = UUID.fromString(session.path("user").path("id").asText());
    call(
        "POST",
        "/workers/me/onboarding",
        token,
        p(
            "societyId",
            "00000000-0000-0000-0000-000000000011",
            "membershipId",
            "MEM-" + n,
            "uan",
            String.format("%012d", n),
            "categoryIds",
            List.of(category),
            "certifications",
            List.of("Plumbing certificate reference")),
        200);
    if (verify) {
      call(
          "PUT",
          "/admin/workers/" + id + "/verification",
          admin,
          p(
              "status",
              "ACTIVE",
              "verifiedCategoryIds",
              List.of(category),
              "note",
              "Documents reviewed for test"),
          200);
      call("PATCH", "/workers/me/availability", token, p("available", true), 200);
    }
    call("PUT", "/workers/me/location", token, p("latitude", lat, "longitude", lng), 200);
    return new Worker(id, token);
  }

  JsonNode quote(String type) throws Exception {
    return call("POST", "/quotes", customer, p("subserviceId", service, "bookingType", type), 200);
  }

  JsonNode job(String type) throws Exception {
    var q = quote(type);
    return call(
        "POST",
        "/jobs",
        customer,
        p(
            "quoteId",
            q.path("id").asText(),
            "latitude",
            13.0827,
            "longitude",
            80.2707,
            "formattedAddress",
            "10 Example Street, Chennai",
            "area",
            "Central Chennai",
            "scheduledTime",
            type.equals("STANDARD") ? java.time.Instant.now().plusSeconds(3600).toString() : null),
        200,
        UUID.randomUUID().toString());
  }

  String complete(Worker w) throws Exception {
    var id = job("EMERGENCY").path("id").asText();
    call("POST", "/jobs/" + id + "/accept", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/travel", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/arrive", w.token(), null, 200);
    var otp =
        call("GET", "/jobs/" + id + "/doorstep-code", customer, null, 200).path("otp").asText();
    call("POST", "/jobs/" + id + "/start", w.token(), p("otp", otp), 200);
    call("POST", "/jobs/" + id + "/complete", w.token(), null, 200);
    return id;
  }

  @Test
  void completeBookingPaymentInvoiceAndRating() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var id = complete(w);
    var pay = call("POST", "/jobs/" + id + "/payments/simulate", customer, null, 200);
    assertThat(pay.path("grossAmount").asDouble()).isEqualTo(500);
    assertThat(pay.path("workerEarning").asDouble()).isEqualTo(500);
    assertThat(pay.path("welfareContribution").asDouble()).isZero();
    assertThat(call("POST", "/jobs/" + id + "/payments/simulate", customer, null, 200).path("id"))
        .isEqualTo(pay.path("id"));
    assertThat(db.count("SELECT count(*) FROM welfare_entry", Map.of())).isEqualTo(1);
    var receipt = call("GET", "/jobs/" + id + "/invoice", customer, null, 200);
    assertThat(receipt.path("snapshot").path("paymentStatus").asText())
        .isEqualTo("SIMULATED_SUCCEEDED");
    assertThat(receipt.toString()).doesNotContain("uanEncrypted");
    call("POST", "/jobs/" + id + "/rating", customer, p("stars", 5, "feedback", "Good"), 200);
    call("POST", "/jobs/" + id + "/rating", customer, p("stars", 4), 409);
    assertThat(call("GET", "/workers/me", w.token(), null, 200).path("avgRating").asDouble())
        .isEqualTo(5);
  }

  @Test
  void emergencyAcceptanceHasExactlyOneWinner() throws Exception {
    var a = worker(true, 13.083, 80.271);
    var b = worker(true, 13.084, 80.272);
    var id = job("EMERGENCY").path("id").asText();
    var barrier = new CyclicBarrier(2);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var futures =
          List.of(a, b).stream()
              .map(
                  w ->
                      pool.submit(
                          () -> {
                            barrier.await();
                            return mvc.perform(
                                    MockMvcRequestBuilders.post("/api/v1/jobs/" + id + "/accept")
                                        .header("Authorization", "Bearer " + w.token()))
                                .andReturn()
                                .getResponse()
                                .getStatus();
                          }))
              .toList();
      assertThat(List.of(futures.get(0).get(), futures.get(1).get()))
          .containsExactlyInAnyOrder(200, 409);
    }
    assertThat(db.count("SELECT count(*) FROM job_offer WHERE status='ACCEPTED'", Map.of()))
        .isEqualTo(1);
  }

  @Test
  void workerCannotAcceptTwoJobsConcurrently() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var first = job("EMERGENCY").path("id").asText();
    var second = job("EMERGENCY").path("id").asText();
    var barrier = new CyclicBarrier(2);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var futures =
          List.of(first, second).stream()
              .map(
                  id ->
                      pool.submit(
                          () -> {
                            barrier.await();
                            return mvc.perform(
                                    MockMvcRequestBuilders.post("/api/v1/jobs/" + id + "/accept")
                                        .header("Authorization", "Bearer " + w.token()))
                                .andReturn()
                                .getResponse()
                                .getStatus();
                          }))
              .toList();
      assertThat(List.of(futures.get(0).get(), futures.get(1).get()))
          .containsExactlyInAnyOrder(200, 409);
    }
  }

  @Test
  void eligibilityExcludesUnverifiedFarStaleAndBusyWorkers() throws Exception {
    var unverified = worker(false, 13.083, 80.271);
    worker(true, 9.925, 78.119);
    var stale = worker(true, 13.083, 80.271);
    db.update(
        "UPDATE worker SET location_updated_at=now()-interval '16 minutes' WHERE user_id=:id",
        p("id", stale.id()));
    var good = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    assertThat(call("GET", "/workers/me/offers", unverified.token(), null, 200).size()).isZero();
    assertThat(db.count("SELECT count(*) FROM job_offer", Map.of())).isEqualTo(1);
    call("POST", "/jobs/" + id + "/accept", good.token(), null, 200);
    assertThat(job("EMERGENCY").path("status").asText()).isEqualTo("EXPIRED");
  }

  @Test
  void otpIsCustomerOnlyAttemptsPersistAndTransitionsAreStrict() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    call("POST", "/jobs/" + id + "/accept", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/complete", w.token(), null, 409);
    call("POST", "/jobs/" + id + "/travel", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/arrive", w.token(), null, 200);
    call("GET", "/jobs/" + id + "/doorstep-code", w.token(), null, 404);
    call("GET", "/jobs/" + id + "/doorstep-code", admin, null, 404);
    var code =
        call("GET", "/jobs/" + id + "/doorstep-code", customer, null, 200).path("otp").asText();
    String wrong = code.equals("000000") ? "111111" : "000000";
    for (int i = 0; i < 5; i++)
      call("POST", "/jobs/" + id + "/start", w.token(), p("otp", wrong), 400);
    call("POST", "/jobs/" + id + "/start", w.token(), p("otp", code), 409);
    assertThat(db.count("SELECT otp_attempts FROM job WHERE id=:id", p("id", UUID.fromString(id))))
        .isEqualTo(5);
  }

  @Test
  void scheduledJobWaitsAndTimeoutDispatchesNextWorker() throws Exception {
    var a = worker(true, 13.083, 80.271);
    worker(true, 13.090, 80.280);
    var scheduled = job("STANDARD");
    assertThat(scheduled.path("status").asText()).isEqualTo("SEARCHING");
    var ticker = new DispatchService.Ticker(dispatch, db);
    db.update("UPDATE job SET scheduled_time=now()+interval '10 minutes'", Map.of());
    tx.executeWithoutResult(s -> ticker.tick());
    assertThat(db.count("SELECT count(*) FROM job_offer", Map.of())).isEqualTo(1);
    db.update("UPDATE job SET offer_deadline=now()-interval '1 second'", Map.of());
    tx.executeWithoutResult(s -> ticker.tick());
    assertThat(db.count("SELECT count(*) FROM job_offer WHERE status='EXPIRED'", Map.of()))
        .isEqualTo(1);
    assertThat(db.count("SELECT count(*) FROM job_offer WHERE status='PENDING'", Map.of()))
        .isEqualTo(1);
  }

  @Test
  void emergencyTimeoutNotifiesAdminThenManualDispatchIsAudited() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    db.update("UPDATE job SET offer_deadline=now()-interval '1 second'", Map.of());
    tx.executeWithoutResult(s -> new DispatchService.Ticker(dispatch, db).tick());
    call("POST", "/jobs/" + id + "/accept", w.token(), null, 409);
    assertThat(call("GET", "/admin/unfulfilled", admin, null, 200).size()).isEqualTo(1);
    call(
        "POST",
        "/admin/jobs/" + id + "/manual-dispatch",
        admin,
        p("workerId", w.id(), "method", "Phone confirmation", "note", "Worker agreed to dispatch"),
        200);
    assertThat(db.count("SELECT count(*) FROM manual_dispatch", Map.of())).isEqualTo(1);
  }

  @Test
  void pricingSnapshotSurvivesConfigChangesAndOnlySurplusFundsWelfare() throws Exception {
    var w = worker(true, 13.083, 80.271);
    db.update("UPDATE allocation_config SET emergency_surcharge=100", Map.of());
    var id = complete(w);
    db.update("UPDATE allocation_config SET welfare_rate=.9,emergency_surcharge=500", Map.of());
    var pay = call("POST", "/jobs/" + id + "/payments/simulate", customer, null, 200);
    assertThat(pay.path("grossAmount").asDouble()).isEqualTo(600);
    assertThat(pay.path("welfareContribution").asDouble()).isEqualTo(50);
    assertThat(pay.path("workerEarning").asDouble()).isEqualTo(550);
  }

  @Test
  void idempotentBookingRejectsDifferentPayload() throws Exception {
    var q = quote("ON_DEMAND");
    var body =
        p(
            "quoteId",
            q.path("id").asText(),
            "latitude",
            13.0827,
            "longitude",
            80.2707,
            "formattedAddress",
            "Example address",
            "area",
            "Chennai");
    var first = call("POST", "/jobs", customer, body, 200, "replay-key");
    assertThat(call("POST", "/jobs", customer, body, 200, "replay-key").path("id"))
        .isEqualTo(first.path("id"));
    body.put("area", "Other");
    call("POST", "/jobs", customer, body, 409, "replay-key");
    assertThat(db.count("SELECT count(*) FROM job", Map.of())).isEqualTo(1);
  }

  @Test
  void authRotationReplayRevokesFamilyAndLogoutRevokesAccess() throws Exception {
    var login = login("+919000000002", "CUSTOMER");
    var refreshed =
        call(
            "POST",
            "/auth/refresh",
            null,
            p("refreshToken", login.path("refreshToken").asText()),
            200);
    call(
        "POST", "/auth/refresh", null, p("refreshToken", login.path("refreshToken").asText()), 401);
    call("GET", "/me", refreshed.path("accessToken").asText(), null, 401);
    call("POST", "/me/logout", customer, null, 200);
    call("GET", "/me", customer, null, 401);
  }

  @Test
  void unauthorizedAccessAndInvalidRequestsFailClosed() throws Exception {
    call("GET", "/admin/metrics", customer, null, 403);
    call("GET", "/jobs", null, null, 401);
    var id = job("EMERGENCY").path("id").asText();
    var stranger = login("+919000000003", "CUSTOMER").path("accessToken").asText();
    call("GET", "/jobs/" + id, stranger, null, 404);
    call("POST", "/jobs/" + id + "/payments/simulate", stranger, null, 404);
    call("POST", "/auth/challenges", null, p("phone", "invalid"), 400);
    call(
        "POST",
        "/quotes",
        customer,
        p("subserviceId", service, "bookingType", "EMERGENCY", "grossAmount", 1),
        400);
    call("POST", "/admin/forecast", admin, p("horizonDays", 7), 503);
  }

  @Test
  void retryArchivesOffersAndCancellationBlocksAcceptance() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    call("POST", "/jobs/" + id + "/decline", w.token(), null, 200);
    call(
        "POST",
        "/jobs/" + id + "/retry",
        customer,
        p("radiusM", 6000, "fallbackToOnDemand", true),
        200);
    assertThat(
            db.count(
                "SELECT count(*) FROM audit_log WHERE action='OFFERS_ARCHIVED_BEFORE_RETRY'",
                Map.of()))
        .isEqualTo(1);
    call("POST", "/jobs/" + id + "/cancel", customer, p("reason", "Plans changed"), 200);
    call("POST", "/jobs/" + id + "/accept", w.token(), null, 409);
  }

  @Test
  void configVersionPreventsLostUpdates() throws Exception {
    var cfg =
        p(
            "version",
            1,
            "proximityWeight",
            .6,
            "ratingWeight",
            .2,
            "loadWeight",
            .2,
            "welfareRate",
            .5,
            "emergencySurcharge",
            0,
            "standardRadiusM",
            10000,
            "emergencyRadiusM",
            5000,
            "emergencyTimeoutS",
            75);
    assertThat(call("PUT", "/admin/config", admin, cfg, 200).path("version").asInt()).isEqualTo(2);
    call("PUT", "/admin/config", admin, cfg, 409);
    cfg.put("version", 2);
    cfg.put("loadWeight", .5);
    call("PUT", "/admin/config", admin, cfg, 400);
  }

  @Test
  void fixedQuotesBroadcastAndAdminAvailabilityAlignWithFrontend() throws Exception {
    for (var type : List.of("STANDARD", "ON_DEMAND", "EMERGENCY")) {
      var quote =
          call("POST", "/quotes", customer, p("subserviceId", service, "bookingType", type), 200);
      assertThat(quote.path("grossAmount").decimalValue()).isEqualByComparingTo("500.00");
    }
    var w1 = worker(true, 13.083, 80.271);
    var w2 = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    var offer = call("GET", "/workers/me/offers", w1.token(), null, 200).get(0);
    assertThat(offer.path("workerEarning").decimalValue()).isEqualByComparingTo("500.00");
    assertThat(offer.path("welfareContribution").decimalValue()).isZero();
    var allocation = call("GET", "/admin/jobs/" + id + "/allocation", admin, null, 200);
    assertThat(allocation.path("offers").size()).isEqualTo(2);
    for (var o : allocation.path("offers")) {
      assertThat(o.path("score").isNull()).isTrue();
      assertThat(o.path("breakdown").path("mode").asText()).isEqualTo("BROADCAST");
    }
    assertThat(call("GET", "/admin/jobs/" + id + "/eligible-workers", admin, null, 200).size())
        .isEqualTo(2);
    call("POST", "/jobs/" + id + "/accept", w1.token(), null, 200);
    var metrics = call("GET", "/admin/metrics", admin, null, 200);
    assertThat(metrics.path("workers").path("available").asInt()).isEqualTo(1);
    assertThat(metrics.path("jobsToday").asInt()).isEqualTo(1);
    var events = call("GET", "/events", w2.token(), null, 200);
    assertThat(events.toString()).contains("OFFER_CLOSED");
    call("GET", "/admin/jobs/" + id + "/eligible-workers", customer, null, 403);
  }

  @Test
  void expiredDoorstepCodeMustBeRenewedByCustomer() throws Exception {
    var w = worker(true, 13.083, 80.271);
    var id = job("EMERGENCY").path("id").asText();
    call("POST", "/jobs/" + id + "/accept", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/travel", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/arrive", w.token(), null, 200);
    call("POST", "/jobs/" + id + "/doorstep-code/renew", customer, null, 409);
    db.update(
        "UPDATE job SET otp_expires_at=now()-interval '1 second' WHERE id=:id",
        p("id", UUID.fromString(id)));
    call("POST", "/jobs/" + id + "/start", w.token(), p("otp", "123456"), 409);
    call("POST", "/jobs/" + id + "/doorstep-code/renew", w.token(), null, 404);
    var fresh = call("POST", "/jobs/" + id + "/doorstep-code/renew", customer, null, 200);
    call("POST", "/jobs/" + id + "/start", w.token(), p("otp", fresh.path("otp").asText()), 200);
    call("GET", "/jobs/" + id + "/doorstep-code", customer, null, 409);
  }

  @Test
  void openApiExportsRuntimeContract() throws Exception {
    var redirect = mvc.perform(MockMvcRequestBuilders.get("/docs/api")).andReturn().getResponse();
    assertThat(redirect.getStatus()).isEqualTo(302);
    assertThat(redirect.getRedirectedUrl()).isEqualTo("/docs/swagger-ui/index.html");
    for (String path :
        java.util.List.of(
            "/docs/swagger-ui/index.html",
            "/docs/swagger-ui/swagger-ui.css",
            "/docs/swagger-ui/swagger-ui-bundle.js",
            "/v3/api-docs/swagger-config")) {
      assertThat(
              mvc.perform(MockMvcRequestBuilders.get(path)).andReturn().getResponse().getStatus())
          .as(path)
          .isEqualTo(200);
    }
    var response =
        mvc.perform(MockMvcRequestBuilders.get("/v3/api-docs")).andReturn().getResponse();
    assertThat(response.getStatus()).isEqualTo(200);
    var spec = json.readTree(response.getContentAsByteArray());
    assertThat(spec.path("paths").has("/api/v1/jobs/{id}/accept")).isTrue();
    assertThat(spec.path("paths").path("/api/v1/jobs").path("post").path("security").isArray())
        .isTrue();
    assertThat(spec.path("paths").path("/api/v1/auth/challenges").path("post").has("security"))
        .isFalse();
    java.nio.file.Files.createDirectories(java.nio.file.Path.of("target"));
    java.nio.file.Files.writeString(
        java.nio.file.Path.of("target/openapi.json"),
        json.writerWithDefaultPrettyPrinter().writeValueAsString(spec));
  }
}
