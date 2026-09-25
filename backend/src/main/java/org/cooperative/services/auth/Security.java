package org.cooperative.services.auth;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.*;
import javax.crypto.spec.SecretKeySpec;
import org.cooperative.services.common.Db;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

@Configuration
@EnableMethodSecurity
public class Security {
  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }

  @Bean
  JwtEncoder encoder(@Value("${app.jwt-secret}") String secret) {
    return new NimbusJwtEncoder(
        new com.nimbusds.jose.jwk.source.ImmutableSecret<>(
            secret.getBytes(StandardCharsets.UTF_8)));
  }

  @Bean
  JwtDecoder decoder(@Value("${app.jwt-secret}") String secret, Db db) {
    var decoder =
        NimbusJwtDecoder.withSecretKey(
                new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"))
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
    OAuth2TokenValidator<Jwt> session =
        jwt -> {
          try {
            long n =
                db.count(
                    "SELECT count(*) FROM auth_session s JOIN app_user u ON u.id=s.user_id WHERE s.family_id=:family AND s.user_id=:user AND NOT s.revoked AND s.expires_at>now() AND u.role=:role",
                    Db.p(
                        "family",
                        UUID.fromString(jwt.getClaimAsString("sid")),
                        "user",
                        UUID.fromString(jwt.getSubject()),
                        "role",
                        jwt.getClaimAsString("role")));
            if (n > 0) return OAuth2TokenValidatorResult.success();
          } catch (IllegalArgumentException ignored) {
          }
          return OAuth2TokenValidatorResult.failure(
              new OAuth2Error("invalid_token", "Session no longer valid", null));
        };
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer("cooperative-services"), session));
    return decoder;
  }

  @Bean
  SecurityFilterChain chain(HttpSecurity http) throws Exception {
    var defaultResolver = new DefaultBearerTokenResolver();
    BearerTokenResolver resolver =
        request -> {
          String path = request.getRequestURI();
          if (path.startsWith("/api/v1/auth/")
              || path.startsWith("/api/v1/catalog")
              || path.startsWith("/api/v1/societies")
              || path.startsWith("/api/demo/")
              || path.startsWith("/api/v1/demo/")
              || path.startsWith("/actuator")
              || path.startsWith("/v3/api-docs")
              || path.startsWith("/swagger-ui")
              || path.startsWith("/docs")) {
            return null;
          }
          return defaultResolver.resolve(request);
        };

    return http.csrf(c -> c.disable())
        .cors(c -> {})
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/api/demo/**",
                        "/api/v1/demo/**",
                        "/api/v1/auth/**",
                        "/api/v1/catalog/**",
                        "/api/v1/societies",
                        "/actuator/health/**",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/docs/swagger-ui/**",
                        "/docs/api")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(
            o ->
                o.bearerTokenResolver(resolver)
                    .jwt(j -> {})
                    .authenticationEntryPoint(
                        (req, res, e) -> {
                          res.setStatus(401);
                          res.setContentType("application/problem+json");
                          res.getWriter()
                              .write(
                                  "{\"status\":401,\"code\":\"UNAUTHENTICATED\",\"detail\":\"A valid access token is required\"}");
                        }))
        .build();
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors-origins:*}") String origins) {
    var config = new CorsConfiguration();
    if (origins == null || origins.isBlank() || "*".equals(origins.trim())) {
      config.addAllowedOriginPattern("*");
    } else {
      for (String o : origins.split(",")) {
        config.addAllowedOriginPattern(o.trim());
      }
    }
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
    config.addAllowedHeader("*");
    config.setExposedHeaders(List.of("X-Request-Id", "Retry-After", "Authorization"));
    config.setAllowCredentials(false);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
