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
      // 1. Ensure Coimbatore District Federation
      UUID fedId = UUID.fromString("00000000-0000-0000-0000-000000000001");
      db.update(
          """
          INSERT INTO federation (id, name, registration_no, state)
          VALUES (:id, 'Coimbatore District Labour & Services Cooperative Federation', 'TN-FED-2022-001', 'Tamil Nadu')
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            registration_no = EXCLUDED.registration_no,
            state = EXCLUDED.state
          """,
          p("id", fedId));

      // 2. Ensure 4 Coimbatore Cooperative Societies
      UUID cbeCitySocId = UUID.fromString("00000000-0000-0000-0000-000000000010");
      UUID rsPuramSocId = UUID.fromString("00000000-0000-0000-0000-000000000011");
      UUID peelameduSocId = UUID.fromString("00000000-0000-0000-0000-000000000012");
      UUID saibabaSocId = UUID.fromString("00000000-0000-0000-0000-000000000013");

      db.update(
          """
          INSERT INTO society (id, federation_id, name, registration_no, district) VALUES
          (:soc10, :fed, 'Coimbatore City Labour & Artisans Cooperative Society', 'TN-CBE-2023-011', 'Coimbatore'),
          (:soc11, :fed, 'RS Puram Cooperative Workers Union', 'TN-CBE-2023-042', 'Coimbatore'),
          (:soc12, :fed, 'Peelamedu Cooperative Services Guild', 'TN-CBE-2024-008', 'Coimbatore'),
          (:soc13, :fed, 'Saibaba Colony Cooperative Labour Guild', 'TN-CBE-2024-025', 'Coimbatore')
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            registration_no = EXCLUDED.registration_no,
            district = EXCLUDED.district
          """,
          p("fed", fedId, "soc10", cbeCitySocId, "soc11", rsPuramSocId, "soc12", peelameduSocId, "soc13", saibabaSocId));

      // 3. Customer Demo Persona: Ravi Kumar
      UUID raviId = getOrCreateUser("+919876543210", "CUSTOMER", "Ravi Kumar");
      db.update("DELETE FROM worker_skill WHERE worker_id=:id", p("id", raviId));
      db.update("DELETE FROM worker WHERE user_id=:id", p("id", raviId));

      // 4. Federation Admin Demo Persona
      UUID adminId = getOrCreateUser("+919876543200", "ADMIN", "Federation administrator");
      db.update("DELETE FROM worker_skill WHERE worker_id=:id", p("id", adminId));
      db.update("DELETE FROM worker WHERE user_id=:id", p("id", adminId));
      getOrCreateUser("+919999999999", "ADMIN", "Federation administrator");

      // 5. Worker: Arun Electrician (Coimbatore City Labour Society, Gandhipuram: 11.0183, 76.9644)
      UUID arunId = getOrCreateUser("+919876543211", "WORKER", "Arun Electrician");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CBE-001', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0001', '9011',
            '["Skill India Certified - Senior Electrician Grade A"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(76.9644, 11.0183), 4326)::geography, now(), 4.950,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            society_id = :soc,
            membership_id = 'MEM-CBE-001',
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(76.9644, 11.0183), 4326)::geography,
            location_updated_at = now(),
            avg_rating = 4.950
          """,
          p("uid", arunId, "soc", cbeCitySocId));

      db.update(
          """
          DELETE FROM worker_skill WHERE worker_id = :uid;
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE code = 'electrical'
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", arunId));

      // 6. Worker: Karthik Plumber (RS Puram Workers Union, RS Puram: 11.0088, 76.9482)
      UUID karthikId = getOrCreateUser("+919876543212", "WORKER", "Karthik Plumber");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CBE-002', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0002', '9012',
            '["Cooperative Certified Master Plumber"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(76.9482, 11.0088), 4326)::geography, now(), 4.900,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            society_id = :soc,
            membership_id = 'MEM-CBE-002',
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(76.9482, 11.0088), 4326)::geography,
            location_updated_at = now(),
            avg_rating = 4.900
          """,
          p("uid", karthikId, "soc", rsPuramSocId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE code = 'plumbing'
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", karthikId));

      // 7. Worker: Selvam Carpenter (Peelamedu Services Guild, Peelamedu: 11.0267, 77.0055)
      UUID selvamId = getOrCreateUser("+919876543213", "WORKER", "Selvam Carpenter");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CBE-003', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0003', '9013',
            '["Cooperative Certified Specialist Carpenter"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(77.0055, 11.0267), 4326)::geography, now(), 4.850,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            society_id = :soc,
            membership_id = 'MEM-CBE-003',
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(77.0055, 11.0267), 4326)::geography,
            location_updated_at = now(),
            avg_rating = 4.850
          """,
          p("uid", selvamId, "soc", peelameduSocId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE code = 'carpentry'
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", selvamId));

      // 8. Worker: Ramu Painter (Saibaba Colony Guild, Saibaba Colony: 11.0298, 76.9452)
      UUID ramuId = getOrCreateUser("+919876543214", "WORKER", "Ramu Painter");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CBE-004', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0004', '9014',
            '["Cooperative Certified Lead Painter"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(76.9452, 11.0298), 4326)::geography, now(), 4.800,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            society_id = :soc,
            membership_id = 'MEM-CBE-004',
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(76.9452, 11.0298), 4326)::geography,
            location_updated_at = now(),
            avg_rating = 4.800
          """,
          p("uid", ramuId, "soc", saibabaSocId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE code = 'painting'
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", ramuId));

      // 9. Worker: Kavitha Housekeeping (Coimbatore City Labour Society, Gandhipuram: 11.0150, 76.9700)
      UUID kavithaId = getOrCreateUser("+919876543215", "WORKER", "Kavitha Housekeeping");
      db.update(
          """
          INSERT INTO worker(
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          )
          VALUES (
            :uid, :soc, 'MEM-CBE-005', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0005', '9015',
            '["Cooperative Certified Sanitation Specialist"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
            true, ST_SetSRID(ST_MakePoint(76.9700, 11.0150), 4326)::geography, now(), 4.900,
            'ENROLLED', 'ENROLLED'
          )
          ON CONFLICT (user_id) DO UPDATE SET
            society_id = :soc,
            membership_id = 'MEM-CBE-005',
            is_available = true,
            verification_status = 'ACTIVE',
            current_location = ST_SetSRID(ST_MakePoint(76.9700, 11.0150), 4326)::geography,
            location_updated_at = now(),
            avg_rating = 4.900
          """,
          p("uid", kavithaId, "soc", cbeCitySocId));

      db.update(
          """
          INSERT INTO worker_skill (worker_id, category_id, verified)
          SELECT :uid, id, true FROM category WHERE code IN ('cleaning', 'domestic_help')
          ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true
          """,
          p("uid", kavithaId));

      log.info("DemoDataSeeder: Successfully seeded Coimbatore cooperative societies and verified trade workers.");
    } catch (Exception e) {
      log.error("DemoDataSeeder: Error while seeding Coimbatore demo personas", e);
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
