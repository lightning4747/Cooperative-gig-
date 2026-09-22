package org.cooperative.services.auth;

import java.util.UUID;
import org.cooperative.services.common.Db;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class Bootstrap implements ApplicationRunner {
  private final Db db;
  private final String phone;

  public Bootstrap(Db db, @Value("${app.bootstrap-admin-phone}") String phone) {
    this.db = db;
    this.phone = phone;
  }

  public void run(ApplicationArguments args) {
    if (phone.isBlank()) return;
    if (!phone.matches("\\+[1-9][0-9]{7,14}"))
      throw new IllegalArgumentException("Invalid bootstrap admin phone");
    db.update(
        "INSERT INTO app_user(id,phone,role,name) VALUES (:id,:phone,'ADMIN','Federation administrator') ON CONFLICT(phone) DO NOTHING",
        Db.p("id", UUID.randomUUID(), "phone", phone));
    if (db.count(
            "SELECT count(*) FROM app_user WHERE phone=:phone AND role='ADMIN'",
            Db.p("phone", phone))
        != 1)
      throw new IllegalStateException(
          "Bootstrap phone already belongs to a non-admin; refusing privilege escalation");
  }
}
