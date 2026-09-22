package org.cooperative.services.common;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class Errors {
  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ProblemDetail> domain(ApiException e, HttpServletRequest request) {
    return problem(e.status, e.code, e.getMessage(), request);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ProblemDetail> validation(
      MethodArgumentNotValidException e, HttpServletRequest request) {
    var response = problem(400, "VALIDATION_FAILED", "Correct the highlighted fields", request);
    response
        .getBody()
        .setProperty(
            "errors",
            e.getBindingResult().getFieldErrors().stream()
                .map(
                    f ->
                        Map.of(
                            "field",
                            f.getField(),
                            "message",
                            Objects.requireNonNullElse(f.getDefaultMessage(), "Invalid value")))
                .toList());
    return response;
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MethodArgumentTypeMismatchException.class,
    HandlerMethodValidationException.class
  })
  public ResponseEntity<ProblemDetail> malformed(Exception e, HttpServletRequest r) {
    return problem(400, "INVALID_REQUEST", "Malformed request or invalid parameter", r);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ProblemDetail> integrity(Exception e, HttpServletRequest r) {
    return problem(
        409, "CONFLICT", "The request conflicts with an existing record or constraint", r);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ProblemDetail> denied(Exception e, HttpServletRequest r) {
    return problem(403, "FORBIDDEN", "This operation is not permitted", r);
  }

  private ResponseEntity<ProblemDetail> problem(
      int status, String code, String detail, HttpServletRequest request) {
    var body = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(status), detail);
    body.setType(URI.create("urn:cooperative:error:" + code.toLowerCase(Locale.ROOT)));
    body.setProperty("code", code);
    body.setProperty("requestId", request.getAttribute("requestId"));
    var builder = ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON);
    if (status == 429) builder.header("Retry-After", "60");
    return builder.body(body);
  }
}
