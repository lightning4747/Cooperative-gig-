package org.cooperative.services.common;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class Crypto {
  private final SecureRandom random = new SecureRandom();
  private final byte[] key;
  private final byte[] pepper;

  public Crypto(
      @Value("${app.encryption-key}") String encryptionKey,
      @Value("${app.jwt-secret}") String secret) {
    key = Base64.getDecoder().decode(encryptionKey);
    pepper = secret.getBytes(StandardCharsets.UTF_8);
    if (key.length != 32 || pepper.length < 32)
      throw new IllegalArgumentException(
          "ENCRYPTION_KEY must encode 32 bytes; JWT_SECRET needs at least 32 bytes");
  }

  public String otp() {
    return "%06d".formatted(random.nextInt(1_000_000));
  }

  public String token() {
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  public String hash(String input) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(pepper, "HmacSHA256"));
      return HexFormat.of().formatHex(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  public boolean matches(String input, String hash) {
    return MessageDigest.isEqual(
        hash(input).getBytes(StandardCharsets.UTF_8), hash.getBytes(StandardCharsets.UTF_8));
  }

  public String encrypt(String value) {
    try {
      byte[] iv = new byte[12];
      random.nextBytes(iv);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(
          Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
      byte[] encrypted = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
      byte[] out = Arrays.copyOf(iv, iv.length + encrypted.length);
      System.arraycopy(encrypted, 0, out, iv.length, encrypted.length);
      return Base64.getEncoder().encodeToString(out);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  public String decrypt(String value) {
    try {
      byte[] bytes = Base64.getDecoder().decode(value);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(
          Cipher.DECRYPT_MODE,
          new SecretKeySpec(key, "AES"),
          new GCMParameterSpec(128, Arrays.copyOf(bytes, 12)));
      return new String(
          cipher.doFinal(Arrays.copyOfRange(bytes, 12, bytes.length)), StandardCharsets.UTF_8);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }
}
