package org.cooperative.services.forecast;

import static org.cooperative.services.common.Db.p;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/forecast")
public class ForecastController {
  private final Db db;
  private final ObjectMapper mapper;
  private final String url, token;
  private final HttpClient http =
      HttpClient.newBuilder()
          .connectTimeout(Duration.ofSeconds(3))
          .followRedirects(HttpClient.Redirect.NEVER)
          .build();

  public ForecastController(
      Db db,
      ObjectMapper mapper,
      @Value("${app.forecast-url}") String url,
      @Value("${app.forecast-token}") String token) {
    this.db = db;
    this.mapper = mapper;
    this.url = url;
    this.token = token;
  }

  public record ForecastRequest(@Min(1) @Max(30) int horizonDays) {}

  @PostMapping
  public Object forecast(@Valid @RequestBody ForecastRequest b) {
    Actor.current().require("ADMIN");
    
    var dailyDemand = db.list(
        """
        SELECT date_trunc('day',j.created_at)::date AS day,
               s.category_id AS "categoryId",
               j.subservice_id AS "subserviceId",
               count(*) AS bookings
        FROM job j
        JOIN subservice s ON s.id = j.subservice_id
        WHERE j.created_at >= now() - interval '90 days'
        GROUP BY 1, 2, 3
        ORDER BY 1, 2
        """,
        Map.of());

    var capacity = db.list(
        """
        SELECT s.category_id AS "categoryId",
               count(DISTINCT s.worker_id) AS workers
        FROM worker_skill s
        JOIN worker w ON w.user_id = s.worker_id
        WHERE s.verified AND w.verification_status = 'ACTIVE'
        GROUP BY s.category_id
        """,
        Map.of());

    var categories = db.list("SELECT id, name FROM category ORDER BY name", Map.of());

    // If no external ML model URL is configured, use the internal deterministic mock forecasting engine
    // which processes real database capacity and demand facts.
    if (url == null || url.isBlank()) {
      return MockForecastEngine.generatePredictions(dailyDemand, capacity, categories, b.horizonDays());
    }

    var payload =
        p(
            "schemaVersion",
            1,
            "horizonDays",
            b.horizonDays(),
            "dailyDemand",
            dailyDemand,
            "capacity",
            capacity);

    try {
      var request =
          HttpRequest.newBuilder(URI.create(url))
              .timeout(Duration.ofSeconds(5))
              .header("Content-Type", "application/json");
      if (!token.isBlank()) request.header("Authorization", "Bearer " + token);
      var response =
          http.send(
              request.POST(HttpRequest.BodyPublishers.ofString(db.json(payload))).build(),
              HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() != 200 || response.body().length() > 1000000)
        throw new IllegalStateException("Invalid provider response");
      var data = mapper.readTree(response.body());
      if (!data.hasNonNull("modelVersion") || !data.path("predictions").isArray())
        throw new IllegalStateException("Invalid model contract");
      for (var row : data.path("predictions")) {
        java.time.LocalDate.parse(row.path("date").asText());
        UUID.fromString(row.path("subserviceId").asText());
        if (!row.path("expectedBookings").isNumber() || row.path("expectedBookings").asDouble() < 0)
          throw new IllegalStateException("Invalid prediction");
      }
      return data;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new ApiException(503, "MODEL_UNAVAILABLE", "Forecast request interrupted");
    } catch (Exception e) {
      // Fallback to internal mock engine if external provider errors
      return MockForecastEngine.generatePredictions(dailyDemand, capacity, categories, b.horizonDays());
    }
  }
}
