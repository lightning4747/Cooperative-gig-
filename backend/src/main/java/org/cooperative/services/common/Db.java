package org.cooperative.services.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.*;
import org.postgresql.util.PGobject;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

/** SQL stays explicit: PostGIS queries and row locks are part of the domain contract. */
@Component
public class Db {
  private final NamedParameterJdbcTemplate jdbc;
  private final ObjectMapper mapper;

  public Db(NamedParameterJdbcTemplate jdbc, ObjectMapper mapper) {
    this.jdbc = jdbc;
    this.mapper = mapper;
  }

  public static Map<String, Object> p(Object... pairs) {
    var result = new HashMap<String, Object>();
    for (int i = 0; i < pairs.length; i += 2) result.put((String) pairs[i], pairs[i + 1]);
    return result;
  }

  public int update(String sql, Map<String, ?> params) {
    return jdbc.update(sql, params);
  }

  public List<Map<String, Object>> list(String sql, Map<String, ?> params) {
    return jdbc.query(sql, params, this::row);
  }

  public Optional<Map<String, Object>> optional(String sql, Map<String, ?> params) {
    return list(sql, params).stream().findFirst();
  }

  public Map<String, Object> one(String sql, Map<String, ?> params) {
    return optional(sql, params).orElseThrow(() -> ApiException.notFound("Record not found"));
  }

  public long count(String sql, Map<String, ?> params) {
    return Objects.requireNonNull(jdbc.queryForObject(sql, params, Long.class));
  }

  public String json(Object value) {
    try {
      return mapper.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  private Map<String, Object> row(ResultSet rs, int index) throws SQLException {
    var result = new LinkedHashMap<String, Object>();
    var meta = rs.getMetaData();
    for (int i = 1; i <= meta.getColumnCount(); i++) {
      Object value = rs.getObject(i);
      if (value instanceof PGobject pg
          && ("jsonb".equals(pg.getType()) || "json".equals(pg.getType()))) {
        try {
          value = mapper.readValue(pg.getValue(), Object.class);
        } catch (JsonProcessingException e) {
          throw new SQLException(e);
        }
      }
      if (value instanceof Timestamp time) value = time.toInstant();
      String name = meta.getColumnLabel(i);
      StringBuilder camel = new StringBuilder();
      boolean upper = false;
      for (char c : name.toCharArray()) {
        if (c == '_') upper = true;
        else {
          camel.append(upper ? Character.toUpperCase(c) : c);
          upper = false;
        }
      }
      result.put(camel.toString(), value);
    }
    return result;
  }

  public void audit(UUID actor, String action, Object entity, Object details) {
    update(
        "INSERT INTO audit_log(actor_id,action,entity_id,details) VALUES (:actor,:action,:entity,CAST(:details AS jsonb))",
        p("actor", actor, "action", action, "entity", entity.toString(), "details", json(details)));
  }
}
