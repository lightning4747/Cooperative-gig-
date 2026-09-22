package org.cooperative.services.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiDocumentation {
  @Bean
  OpenAPI api() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Cooperative Services API")
                .version("0.1.0")
                .description(
                    "Runnable prototype. Development OTP and simulated payments are explicitly gated. See docs/api-contract.md for response examples and integration rules."))
        .components(
            new Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
  }

  @Bean
  OpenApiCustomizer authorizationDocumentation() {
    return api ->
        api.getPaths()
            .forEach(
                (path, item) -> {
                  boolean publicPath =
                      path.startsWith("/api/v1/auth/")
                          || path.startsWith("/api/v1/catalog/")
                          || path.equals("/api/v1/societies");
                  if (!publicPath)
                    item.readOperations()
                        .forEach(
                            operation ->
                                operation.addSecurityItem(
                                    new SecurityRequirement().addList("bearerAuth")));
                });
  }
}
