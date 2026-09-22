package org.cooperative.services.seed;

import static org.cooperative.services.common.Db.p;

import java.util.UUID;
import org.cooperative.services.common.Db;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataSeeder implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

  private final Db db;
  private final boolean dev;

  public DemoDataSeeder(Db db, @Value("${app.dev-auth:false}") boolean dev) {
    this.db = db;
    this.dev = dev;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (!dev) {
      log.info("DemoDataSeeder: dev mode disabled, skipping demo seed");
      return;
    }

    try {
      var societyOpt = db.optional("SELECT id FROM society ORDER BY id LIMIT 1", p());
      if (societyOpt.isEmpty()) {
        log.warn("DemoDataSeeder: No societies found in database. Skipping seeder.");
        return;
      }
      UUID societyId = (UUID) societyOpt.get().get("id");

      // 1. Customer Demo Persona: Ravi Kumar
      getOrCreateUser("+919876543210", "CUSTOMER", "Ravi Kumar");

      // 2. Federation Admin Demo Persona
      getOrCreateUser("+919876543200", "ADMIN", "Federation administrator");
      getOrCreateUser("+919999999999", "ADMIN", "Federation administrator");

      // 3. Worker Demo Persona: Arun Electrician (Active, Available, All trade categories verified)
      UUID arunId = getOrCreateUser("+919876543211", "WORKER", "Arun Electrician");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CH-999', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff54', '9012',
            '["Cooperative Certified Grade A"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(77.621, 12.934), 4326)::geography, now(), 5.000,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(77.621, 12.934), 4326)::geography,
            location_updated_at = now()
          """,
          p("uid", arunId, "soc", societyId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", arunId));

      // 4. Worker Demo Persona: Pooja Sharma (Active, Available)
      UUID poojaId = getOrCreateUser("+919876543220", "WORKER", "Pooja Sharma");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CH-101', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff55', '1011',
            '["Cooperative Certified"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(77.635, 12.928), 4326)::geography, now(), 4.800,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(77.635, 12.928), 4326)::geography,
            location_updated_at = now()
          """,
          p("uid", poojaId, "soc", societyId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE name IN ('Electrical', 'Cleaning', 'Domestic Help', 'Caregiving')
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", poojaId));

      // 5. Worker Demo Persona: Vijay Plumber (Pending Verification)
      UUID vijayId = getOrCreateUser("+919876543225", "WORKER", "Vijay Plumber");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CH-102', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff56', '1022',
            '["Apprentice Plumbing"]'::jsonb, 'PENDING_VERIFICATION', 'Awaiting certificate validation',
            false, ST_SetSRID(ST_MakePoint(77.610, 12.940), 4326)::geography, now(), 4.500,
            'NOT_ENROLLED', 'NOT_ENROLLED'
          )
          ON CONFLICT (user_id) DO NOTHING
          """,
          p("uid", vijayId, "soc", societyId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, false FROM category WHERE name = 'Plumbing'
          ON CONFLICT (worker_id, category_id) DO NOTHING
          """,
          p("uid", vijayId));

      log.info("DemoDataSeeder: Successfully verified and seeded demo personas and workers.");
    } catch (Exception e) {
      log.error("DemoDataSeeder: Error while seeding demo personas", e);
    }
  }

  private UUID getOrCreateUser(String phone, String role, String name) {
    var existing = db.optional("SELECT id FROM app_user WHERE phone=:phone", p("phone", phone));
    if (existing.isPresent()) {
      UUID id = (UUID) existing.get().get("id");
      db.update("UPDATE app_user SET role=:role, name=:name WHERE id=:id", p("id", id, "role", role, "name", name));
      return id;
    }
    UUID id = UUID.randomUUID();
    db.update(
        "INSERT INTO app_user(id,phone,role,name) VALUES (:id,:phone,:role,:name) ON CONFLICT(phone) DO NOTHING",
        p("id", id, "phone", phone, "role", role, "name", name));
    return (UUID) db.one("SELECT id FROM app_user WHERE phone=:phone", p("phone", phone)).get("id");
  }
}
