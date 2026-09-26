package org.cooperative.services.common;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

  @GetMapping(value = {"/", "/health", "/api/health", "/api/v1/health"})
  public ResponseEntity<Map<String, Object>> hello() {
    return ResponseEntity.ok(
        Map.of(
            "status", "UP",
            "message", "Hello World! Cooperative Gig Backend is running.",
            "timestamp", Instant.now().toString()));
  }
}
