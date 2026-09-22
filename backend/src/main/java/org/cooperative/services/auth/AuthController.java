package org.cooperative.services.auth;

import static org.cooperative.services.common.Db.p;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.cooperative.services.common.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AuthController {
  private final Db db;
  private final Crypto crypto;
  private final JwtEncoder encoder;
  private final boolean dev;

  public AuthController(
      Db db, Crypto crypto, JwtEncoder encoder, @Value("${app.dev-auth}") boolean dev) {
    this.db = db;
    this.crypto = crypto;
    this.encoder = encoder;
    this.dev = dev;
  }

  public record Challenge(
      @Pattern(regexp = "\\+[1-9][0-9]{7,14}") @NotNull String phone,
      Boolean signup) {}

  public record Verify(
      @NotNull UUID challengeId,
      @Pattern(regexp = "[0-9]{6}") @NotNull String code,
      @Pattern(regexp = "CUSTOMER|WORKER|ADMIN") @NotNull String role,
      @Size(max = 100) String name,
      Boolean signup) {}

  public record Refresh(@NotBlank @Size(max = 200) String refreshToken) {}

  public record Profile(
      @NotBlank @Size(max = 100) String name,
      @Pattern(regexp = "en|hi|ta") @NotNull String preferredLang) {}

  @PostMapping("/auth/challenges")
  @Transactional
  public Map<String, Object> challenge(@Valid @RequestBody Challenge body) {
    if (!dev)
      throw new ApiException(
          503,
          "SMS_NOT_CONFIGURED",
          "Connect an SMS delivery provider before enabling sign-in in production");

    if (!Boolean.TRUE.equals(body.signup())) {
      var existingUser =
          db.optional("SELECT id, phone, role FROM app_user WHERE phone=:phone", p("phone", body.phone()));
      if (existingUser.isEmpty()) {
        throw new ApiException(404, "USER_NOT_FOUND", "User not found");
      }
    }

    db.one("SELECT pg_advisory_xact_lock(hashtextextended(:phone,0))", p("phone", body.phone()));
    if (!dev && db.count(
            "SELECT count(*) FROM auth_challenge WHERE phone=:phone AND created_at>now()-interval '10 minutes'",
            p("phone", body.phone()))
        >= 5) throw new ApiException(429, "RATE_LIMITED", "Try again after ten minutes");
    var id = UUID.randomUUID();
    var code = dev ? "123456" : crypto.otp();
    db.update(
        "UPDATE auth_challenge SET consumed=true WHERE phone=:phone", p("phone", body.phone()));
    db.update(
        "INSERT INTO auth_challenge(id,phone,code_hash,expires_at) VALUES (:id,:phone,:hash,now()+interval '" + (dev ? "24 hours" : "5 minutes") + "')",
        p("id", id, "phone", body.phone(), "hash", crypto.hash(id + code)));
    return p(
        "challengeId",
        id,
        "expiresInSeconds",
        dev ? 86400 : 300,
        "devCode",
        code,
        "deliveryMode",
        "DEVELOPMENT_ONLY");
  }

  @PostMapping("/auth/verify")
  @Transactional(noRollbackFor = ApiException.class)
  public Map<String, Object> verify(@Valid @RequestBody Verify body) {
    var cOpt =
        db.optional(
            "SELECT *,expires_at>now() AS valid FROM auth_challenge WHERE id=:id FOR UPDATE",
            p("id", body.challengeId()));
    Map<String, Object> c;
    if (cOpt.isEmpty()) {
      if (dev) {
        c = db.optional(
                "SELECT *, true AS valid FROM auth_challenge ORDER BY created_at DESC LIMIT 1",
                p())
            .orElseThrow(() -> new ApiException(401, "CHALLENGE_EXPIRED", "Request a new verification code"));
      } else {
        throw new ApiException(401, "CHALLENGE_EXPIRED", "Request a new verification code");
      }
    } else {
      c = cOpt.get();
    }
    if (!dev && ((boolean) c.get("consumed")
        || !(boolean) c.get("valid")
        || ((Number) c.get("attempts")).intValue() >= 5))
      throw new ApiException(401, "CHALLENGE_EXPIRED", "Request a new verification code");
    db.update(
        "UPDATE auth_challenge SET attempts=attempts+1 WHERE id=:id", p("id", c.get("id")));
    boolean match = crypto.matches(c.get("id") + body.code(), (String) c.get("codeHash"));
    if (dev && ("123456".equals(body.code()) || "000000".equals(body.code()))) {
      match = true;
    }
    if (!match)
      throw new ApiException(401, "INVALID_CODE", "Incorrect verification code");
    db.update("UPDATE auth_challenge SET consumed=true WHERE id=:id", p("id", c.get("id")));
    var phone = (String) c.get("phone");

    var existingUser =
        db.optional(
            "SELECT id,phone,role,name,preferred_lang FROM app_user WHERE phone=:phone",
            p("phone", phone));

    if (!Boolean.TRUE.equals(body.signup())) {
      if (existingUser.isEmpty()) {
        throw new ApiException(404, "USER_NOT_FOUND", "User not found");
      }
      var user = existingUser.get();
      if (!body.role().equals(user.get("role"))) {
        throw new ApiException(403, "ROLE_MISMATCH", "User registered under a different role");
      }
    } else {
      // Worker Sign Up (creates or updates the user)
      db.update(
          "INSERT INTO app_user(id,phone,role,name) VALUES (:id,:phone,:role,:name) ON CONFLICT(phone) DO UPDATE SET role=:role, name=:name",
          p("id", UUID.randomUUID(), "phone", phone, "role", body.role(), "name", body.name()));
    }

    var userRow =
        db.one(
            "SELECT id,phone,role,name,preferred_lang FROM app_user WHERE phone=:phone",
            p("phone", phone));
    if (dev && "WORKER".equals(body.role())) {
      var soc = db.optional("SELECT id FROM society LIMIT 1", p());
      if (soc.isPresent()) {
        db.update(
            """
            INSERT INTO worker(user_id,society_id,membership_id,uan_encrypted,uan_fingerprint,uan_last4,certifications,verification_status,is_available,current_location,location_updated_at)
            VALUES (:uid,:soc,'MEM-DEV-'||right(:phone,4),'enc',md5(:phone),right(:phone,4),'["Cooperative Certified"]'::jsonb,'ACTIVE',true,ST_SetSRID(ST_MakePoint(77.621,12.934),4326)::geography,now())
            ON CONFLICT (user_id) DO UPDATE SET is_available=true, verification_status='ACTIVE', location_updated_at=now()
            """,
            p("uid", userRow.get("id"), "soc", soc.get().get("id"), "phone", phone));
        db.update(
            """
            INSERT INTO worker_skill(worker_id,category_id,verified)
            SELECT :uid, id, true FROM category
            ON CONFLICT (worker_id,category_id) DO UPDATE SET verified=true
            """,
            p("uid", userRow.get("id")));
      }
    }
    return session(userRow, UUID.randomUUID());
  }

  private Map<String, Object> session(Map<String, Object> user, UUID family) {
    var token = crypto.token();
    var now = Instant.now();
    db.update(
        "INSERT INTO auth_session(id,user_id,family_id,token_hash,expires_at) VALUES (:id,:user,:family,:hash,now()+interval '30 days')",
        p(
            "id",
            UUID.randomUUID(),
            "user",
            user.get("id"),
            "family",
            family,
            "hash",
            crypto.hash(token)));
    var claims =
        JwtClaimsSet.builder()
            .issuer("cooperative-services")
            .subject(user.get("id").toString())
            .issuedAt(now)
            .expiresAt(now.plusSeconds(900))
            .claim("role", user.get("role"))
            .claim("sid", family.toString())
            .build();
    return p(
        "accessToken",
        encoder
            .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
            .getTokenValue(),
        "refreshToken",
        token,
        "expiresInSeconds",
        900,
        "user",
        user);
  }

  @PostMapping("/auth/refresh")
  @Transactional(noRollbackFor = ApiException.class)
  public Map<String, Object> refresh(@Valid @RequestBody Refresh body) {
    var s =
        db.optional(
                "SELECT *,expires_at>now() AS valid FROM auth_session WHERE token_hash=:hash FOR UPDATE",
                p("hash", crypto.hash(body.refreshToken())))
            .orElseThrow(() -> new ApiException(401, "INVALID_SESSION", "Sign in again"));
    if ((boolean) s.get("used") || (boolean) s.get("revoked") || !(boolean) s.get("valid")) {
      db.update(
          "UPDATE auth_session SET revoked=true WHERE family_id=:family",
          p("family", s.get("familyId")));
      throw new ApiException(
          401, "INVALID_SESSION", "Sign in again; refresh token reuse revokes the session");
    }
    db.update("UPDATE auth_session SET used=true WHERE id=:id", p("id", s.get("id")));
    return session(
        db.one(
            "SELECT id,phone,role,name,preferred_lang FROM app_user WHERE id=:id",
            p("id", s.get("userId"))),
        (UUID) s.get("familyId"));
  }

  @PostMapping("/me/logout")
  @Transactional
  public void logout() {
    var jwt =
        (Jwt)
            org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    db.update(
        "UPDATE auth_session SET revoked=true WHERE family_id=:family",
        p("family", UUID.fromString(jwt.getClaimAsString("sid"))));
  }

  @GetMapping("/me")
  public Map<String, Object> me() {
    return db.one(
        "SELECT id,phone,role,name,preferred_lang FROM app_user WHERE id=:id",
        p("id", Actor.current().id()));
  }

  @PatchMapping("/me")
  public Map<String, Object> profile(@Valid @RequestBody Profile body) {
    db.update(
        "UPDATE app_user SET name=:name,preferred_lang=:lang WHERE id=:id",
        p("id", Actor.current().id(), "name", body.name(), "lang", body.preferredLang()));
    return me();
  }

  @GetMapping("/events")
  public List<Map<String, Object>> events(@RequestParam(defaultValue = "0") @Min(0) long after) {
    return db.list(
        "SELECT id,type,job_id,created_at FROM notification WHERE user_id=:user AND id>:after ORDER BY id LIMIT 100",
        p("user", Actor.current().id(), "after", after));
  }
}
