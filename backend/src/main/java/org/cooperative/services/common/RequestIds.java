package org.cooperative.services.common;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestIds extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String id = UUID.randomUUID().toString();
    req.setAttribute("requestId", id);
    res.setHeader("X-Request-Id", id);
    res.setHeader("Cache-Control", "no-store");
    chain.doFilter(req, res);
  }
}
