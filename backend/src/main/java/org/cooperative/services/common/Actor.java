package org.cooperative.services.common;

import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public record Actor(UUID id, String role) {
  public static Actor current() {
    Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return new Actor(UUID.fromString(jwt.getSubject()), jwt.getClaimAsString("role"));
  }

  public void require(String expected) {
    if (!role.equals(expected)) throw ApiException.forbidden();
  }

  public boolean admin() {
    return role.equals("ADMIN");
  }
}
