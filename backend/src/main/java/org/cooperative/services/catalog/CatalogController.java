package org.cooperative.services.catalog;

import java.util.*;
import org.cooperative.services.common.Db;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
  private final Db db;

  public CatalogController(Db db) {
    this.db = db;
  }

  @GetMapping("/catalog/categories")
  public List<Map<String, Object>> categories() {
    return db.list("SELECT * FROM category ORDER BY name", Map.of());
  }

  @GetMapping("/catalog/subservices")
  public List<Map<String, Object>> services(@RequestParam(required = false) UUID categoryId) {
    return db.list(
        "SELECT *, 'INR' AS currency FROM subservice WHERE active AND (CAST(:category AS uuid) IS NULL OR category_id=:category) ORDER BY name",
        Db.p("category", categoryId));
  }

  @GetMapping("/societies")
  public List<Map<String, Object>> societies() {
    return db.list("SELECT * FROM society ORDER BY name", Map.of());
  }
}
