package org.cooperative.services.seed;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DemoController {
  private static final Logger log = LoggerFactory.getLogger(DemoController.class);

  private final DemoResetService resetService;
  private final boolean demoMode;
  private final String resetToken;

  public DemoController(
      DemoResetService resetService,
      @Value("${app.demo-mode:true}") boolean demoMode,
      @Value("${app.demo-reset-token:cooperative-demo-reset-2026}") String resetToken) {
    this.resetService = resetService;
    this.demoMode = demoMode;
    this.resetToken = resetToken;
  }

  @PostMapping({"/api/demo/reset", "/api/v1/demo/reset"})
  public ResponseEntity<?> reset(
      @RequestHeader(value = "X-Demo-Reset-Token", required = false) String headerToken,
      @RequestBody(required = false) Map<String, Object> body) {

    if (!demoMode) {
      log.warn("Demo reset rejected: DEMO_MODE is disabled");
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
          "status", 404,
          "code", "NOT_FOUND",
          "message", "Demo reset endpoint is disabled"
      ));
    }

    String providedToken = headerToken;
    if ((providedToken == null || providedToken.isBlank()) && body != null && body.containsKey("token")) {
      providedToken = String.valueOf(body.get("token"));
    }

    if (providedToken == null || !providedToken.equals(resetToken)) {
      log.warn("Demo reset rejected: Invalid reset token provided");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
          "status", 401,
          "code", "UNAUTHORIZED",
          "message", "Invalid demo reset token"
      ));
    }

    try {
      var stats = resetService.resetAndSeed();
      log.info("Demo reset executed successfully via API endpoint.");
      return ResponseEntity.ok(Map.of(
          "status", "SUCCESS",
          "message", "Demo dataset successfully restored to initial baseline",
          "stats", stats
      ));
    } catch (Exception e) {
      log.error("Demo reset failed during execution", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
          "status", 500,
          "code", "RESET_ERROR",
          "message", "Failed to reset demo dataset: " + e.getMessage()
      ));
    }
  }
}
