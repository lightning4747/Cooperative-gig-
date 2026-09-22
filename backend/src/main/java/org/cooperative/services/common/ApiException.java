package org.cooperative.services.common;

public class ApiException extends RuntimeException {
  public final int status;
  public final String code;

  public ApiException(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public static ApiException notFound(String message) {
    return new ApiException(404, "NOT_FOUND", message);
  }

  public static ApiException conflict(String code, String message) {
    return new ApiException(409, code, message);
  }

  public static ApiException conflict(String message) {
    return conflict("CONFLICT", message);
  }

  public static ApiException forbidden(String message) {
    return new ApiException(403, "FORBIDDEN", message);
  }

  public static ApiException bad(String message) {
    return new ApiException(400, "INVALID_REQUEST", message);
  }

  public static ApiException forbidden() {
    return new ApiException(403, "FORBIDDEN", "This operation is not permitted");
  }
}
