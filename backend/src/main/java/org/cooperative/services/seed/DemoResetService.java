package org.cooperative.services.seed;

import static org.cooperative.services.common.Db.p;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;
import org.cooperative.services.common.Db;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoResetService {
  private static final Logger log = LoggerFactory.getLogger(DemoResetService.class);

  private final Db db;

  public DemoResetService(Db db) {
    this.db = db;
  }

  record WorkerSeed(
      UUID id,
      String phone,
      String name,
      UUID societyId,
      String membershipId,
      String uanLast4,
      double lat,
      double lng,
      List<String> skillCategoryCodes,
      String verificationStatus,
      boolean isAvailable,
      double initialRating
  ) {}

  record CustomerSeed(
      UUID id,
      String phone,
      String name,
      String area,
      String address,
      double lat,
      double lng
  ) {}

  @Transactional
  public Map<String, Object> resetAndSeed() {
    log.info("DemoResetService: Starting idempotent demo data reset...");

    // 1. Wipe dynamic and transaction data
    db.update("""
        TRUNCATE TABLE 
          welfare_entry, 
          payment, 
          invoice, 
          job_history, 
          job_offer, 
          manual_dispatch, 
          rating, 
          job, 
          quote, 
          notification, 
          audit_log, 
          auth_session, 
          auth_challenge, 
          worker_skill, 
          worker, 
          app_user 
        RESTART IDENTITY CASCADE
    """, Map.of());

    // Explicit sequence reset
    try {
      db.update("ALTER SEQUENCE job_history_id_seq RESTART WITH 1", Map.of());
      db.update("ALTER SEQUENCE notification_id_seq RESTART WITH 1", Map.of());
      db.update("ALTER SEQUENCE audit_log_id_seq RESTART WITH 1", Map.of());
    } catch (Exception e) {
      log.warn("Sequence reset notice: {}", e.getMessage());
    }

    // 2. 1 State Federation & 3 Coimbatore Cooperative Societies
    UUID fedId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    db.update("""
        INSERT INTO federation (id, name, registration_no, state)
        VALUES (:id, 'Coimbatore District Labour & Services Cooperative Federation', 'TN-FED-2022-001', 'Tamil Nadu')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          registration_no = EXCLUDED.registration_no,
          state = EXCLUDED.state
    """, p("id", fedId));

    UUID socGandhipuram = UUID.fromString("00000000-0000-0000-0000-000000000010");
    UUID socRsPuram = UUID.fromString("00000000-0000-0000-0000-000000000011");
    UUID socSaibaba = UUID.fromString("00000000-0000-0000-0000-000000000013");

    db.update("""
        INSERT INTO society (id, federation_id, name, registration_no, district) VALUES
        (:gandhipuram, :fed, 'Gandhipuram Labour & Artisans Cooperative Society', 'TN-CBE-2023-011', 'Coimbatore'),
        (:rspuram, :fed, 'RS Puram Cooperative Workers Union', 'TN-CBE-2023-042', 'Coimbatore'),
        (:saibaba, :fed, 'Saibaba Colony Cooperative Labour Guild', 'TN-CBE-2024-025', 'Coimbatore')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          registration_no = EXCLUDED.registration_no,
          district = EXCLUDED.district
    """, p("fed", fedId, "gandhipuram", socGandhipuram, "rspuram", socRsPuram, "saibaba", socSaibaba));

    // 3. Admin User
    UUID adminId = UUID.fromString("00000000-0000-0000-0000-000000000100");
    db.update("""
        INSERT INTO app_user (id, phone, role, name, preferred_lang, created_at)
        VALUES (:id, '+919000000000', 'ADMIN', 'Federation Administrator', 'en', now() - interval '90 days')
    """, p("id", adminId));

    // Secondary admin phone (+919876543200) for backward compatibility
    db.update("""
        INSERT INTO app_user (id, phone, role, name, preferred_lang, created_at)
        VALUES (:id, '+919876543200', 'ADMIN', 'Federation Administrator', 'en', now() - interval '90 days')
        ON CONFLICT (phone) DO NOTHING
    """, p("id", UUID.fromString("00000000-0000-0000-0000-000000000101")));

    // 4. 6 Customers (Meena is the main demo customer persona)
    List<CustomerSeed> customers = List.of(
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000201"),
            "+919000000001",
            "Meena",
            "RS Puram",
            "142 DB Road, RS Puram, Coimbatore 641002",
            11.0088,
            76.9482
        ),
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000202"),
            "+919000000002",
            "Senthil Nathan",
            "Gandhipuram",
            "45 Cross Cut Road, Gandhipuram, Coimbatore 641012",
            11.0183,
            76.9644
        ),
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000203"),
            "+919000000003",
            "Anitha Krishnan",
            "Saibaba Colony",
            "18 NSR Road, Saibaba Colony, Coimbatore 641011",
            11.0298,
            76.9452
        ),
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000204"),
            "+919000000004",
            "Balaji Sundaram",
            "RS Puram",
            "28 East TV Swamy Road, RS Puram, Coimbatore 641002",
            11.0110,
            76.9510
        ),
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000205"),
            "+919000000005",
            "Priya Murugan",
            "Saibaba Colony",
            "72 Alagesan Road, Saibaba Colony, Coimbatore 641011",
            11.0315,
            76.9420
        ),
        new CustomerSeed(
            UUID.fromString("00000000-0000-0000-0000-000000000206"),
            "+919000000006",
            "Dinesh Kumar",
            "Gandhipuram",
            "104 100 Feet Road, Gandhipuram, Coimbatore 641012",
            11.0150,
            76.9680
        )
    );

    for (CustomerSeed c : customers) {
      db.update("""
          INSERT INTO app_user (id, phone, role, name, preferred_lang, created_at)
          VALUES (:id, :phone, 'CUSTOMER', :name, 'en', now() - interval '90 days')
      """, p("id", c.id(), "phone", c.phone(), "name", c.name()));
    }

    // Secondary customer phone (+919876543210) for backward compatibility
    db.update("""
        INSERT INTO app_user (id, phone, role, name, preferred_lang, created_at)
        VALUES (:id, '+919876543210', 'CUSTOMER', 'Ravi Kumar', 'en', now() - interval '90 days')
        ON CONFLICT (phone) DO NOTHING
    """, p("id", UUID.fromString("00000000-0000-0000-0000-000000000210")));

    // Category mapping cache
    Map<String, UUID> catMap = db.list("SELECT code, id FROM category", Map.of())
        .stream().collect(Collectors.toMap(r -> (String) r.get("code"), r -> (UUID) r.get("id")));

    // 5. 24 Verified Workers across 6 trades (plus 2 pending verification workers)
    // Note: Saibaba Colony has ONLY 1 plumber (Karthik), creating the demand surge mismatch!
    // RS Puram has verified workers for all services near Meena.
    List<WorkerSeed> workers = List.of(
        // Multi-Trade Lead Artisan: Arun has verified credentials across all core trades
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000301"), "+919000000011", "Arun", socRsPuram, "MEM-CBE-001", "9011", 11.0092, 76.9485, List.of("electrical", "plumbing", "carpentry", "painting", "domestic_help", "cleaning", "caregiving", "driving", "gardening", "technician"), "ACTIVE", true, 4.92),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000302"), "+919000000012", "Murugan Electrician", socGandhipuram, "MEM-CBE-002", "9012", 11.0185, 76.9640, List.of("electrical"), "ACTIVE", true, 4.75),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000303"), "+919000000013", "Deepa Electrician", socGandhipuram, "MEM-CBE-003", "9013", 11.0160, 76.9620, List.of("electrical"), "ACTIVE", true, 4.85),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000304"), "+919000000014", "Rajesh Electrician", socRsPuram, "MEM-CBE-004", "9014", 11.0070, 76.9460, List.of("electrical"), "ACTIVE", true, 4.60),

        // Plumbing (4 verified: Saibaba Colony has ONLY 1, RS Puram has 2, Gandhipuram has 1)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000305"), "+919000000015", "Karthik Plumber", socSaibaba, "MEM-CBE-005", "9015", 11.0298, 76.9452, List.of("plumbing"), "ACTIVE", true, 4.88),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000306"), "+919000000016", "Saravanan Plumber", socRsPuram, "MEM-CBE-006", "9016", 11.0085, 76.9490, List.of("plumbing"), "ACTIVE", true, 4.70),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000307"), "+919000000017", "Vignesh Plumber", socRsPuram, "MEM-CBE-007", "9017", 11.0120, 76.9500, List.of("plumbing"), "ACTIVE", true, 4.55),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000308"), "+919000000018", "Manikandan Plumber", socGandhipuram, "MEM-CBE-008", "9018", 11.0190, 76.9660, List.of("plumbing"), "ACTIVE", true, 4.65),

        // Carpentry (4 verified)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000309"), "+919000000019", "Selvam Carpenter", socRsPuram, "MEM-CBE-009", "9019", 11.0080, 76.9470, List.of("carpentry"), "ACTIVE", true, 4.80),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000310"), "+919000000020", "Mani Carpenter", socGandhipuram, "MEM-CBE-010", "9020", 11.0175, 76.9650, List.of("carpentry"), "ACTIVE", true, 4.65),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000311"), "+919000000021", "Natarajan Carpenter", socGandhipuram, "MEM-CBE-011", "9021", 11.0200, 76.9630, List.of("carpentry"), "ACTIVE", true, 4.50),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000312"), "+919000000022", "Anand Carpenter", socSaibaba, "MEM-CBE-012", "9022", 11.0310, 76.9440, List.of("carpentry"), "ACTIVE", true, 4.40),

        // Painting (4 verified)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000313"), "+919000000023", "Ramu Painter", socRsPuram, "MEM-CBE-013", "9023", 11.0090, 76.9480, List.of("painting"), "ACTIVE", true, 4.75),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000314"), "+919000000024", "Suresh Painter", socGandhipuram, "MEM-CBE-014", "9024", 11.0180, 76.9670, List.of("painting"), "ACTIVE", true, 4.55),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000315"), "+919000000025", "Revathi Painter", socRsPuram, "MEM-CBE-015", "9025", 11.0105, 76.9520, List.of("painting"), "ACTIVE", true, 4.85),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000316"), "+919000000026", "Lakshmi Painter", socSaibaba, "MEM-CBE-016", "9026", 11.0285, 76.9460, List.of("painting"), "ACTIVE", true, 4.60),

        // Cleaning & Domestic Help (4 verified)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000317"), "+919000000027", "Kavitha Housekeeping", socRsPuram, "MEM-CBE-017", "9027", 11.0086, 76.9478, List.of("cleaning", "domestic_help"), "ACTIVE", true, 4.90),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000318"), "+919000000028", "Malathi Cleaning", socSaibaba, "MEM-CBE-018", "9028", 11.0295, 76.9435, List.of("cleaning", "domestic_help"), "ACTIVE", true, 4.75),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000319"), "+919000000029", "Shanthi Domestic Help", socGandhipuram, "MEM-CBE-019", "9029", 11.0170, 76.9635, List.of("cleaning", "domestic_help"), "ACTIVE", true, 4.65),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000320"), "+919000000030", "Radha Housekeeping", socSaibaba, "MEM-CBE-020", "9030", 11.0320, 76.9450, List.of("cleaning", "domestic_help"), "ACTIVE", true, 4.80),

        // Caregiving (4 verified)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000321"), "+919000000031", "Meenakshi Caregiver", socRsPuram, "MEM-CBE-021", "9031", 11.0090, 76.9495, List.of("caregiving"), "ACTIVE", true, 4.95),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000322"), "+919000000032", "Bhavani Caregiver", socSaibaba, "MEM-CBE-022", "9032", 11.0305, 76.9470, List.of("caregiving"), "ACTIVE", true, 4.85),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000323"), "+919000000033", "Vasantha Caregiver", socGandhipuram, "MEM-CBE-023", "9033", 11.0195, 76.9655, List.of("caregiving"), "ACTIVE", true, 4.70),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000324"), "+919000000034", "Uma Caregiver", socSaibaba, "MEM-CBE-024", "9034", 11.0280, 76.9445, List.of("caregiving"), "ACTIVE", true, 4.60),

        // 2 Pending Verification Workers (for Admin Verification Queue)
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000325"), "+919000000035", "Prakash Kumar", socGandhipuram, "MEM-CBE-025", "9035", 11.0170, 76.9640, List.of("plumbing"), "PENDING_VERIFICATION", false, 5.0),
        new WorkerSeed(UUID.fromString("00000000-0000-0000-0000-000000000326"), "+919000000036", "Geetha Sundaram", socSaibaba, "MEM-CBE-026", "9036", 11.0290, 76.9430, List.of("caregiving"), "PENDING_VERIFICATION", false, 5.0)
    );

    // Ravi (9000000099) is deliberately NOT in this list, reserved for live demonstration registration.

    for (WorkerSeed w : workers) {
      db.update("""
          INSERT INTO app_user (id, phone, role, name, preferred_lang, created_at)
          VALUES (:id, :phone, 'WORKER', :name, 'en', now() - interval '90 days')
      """, p("id", w.id(), "phone", w.phone(), "name", w.name()));

      boolean isPending = "PENDING_VERIFICATION".equals(w.verificationStatus());
      String pmsby = isPending ? "PENDING" : "ENROLLED";
      String pmjjby = isPending ? "NOT_ENROLLED" : "ENROLLED";

      db.update("""
          INSERT INTO worker (
            user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
            certifications, verification_status, verification_note, is_available,
            current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
          ) VALUES (
            :uid, :soc, :mem, 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
            :fingerprint, :last4,
            '["Skill India Certified - Cooperative Grade A"]'::jsonb,
            :status, 'Verified credentials in order', :avail,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, now() - interval '2 hours',
            :rating, :pmsby, :pmjjby
          )
      """, p(
          "uid", w.id(),
          "soc", w.societyId(),
          "mem", w.membershipId(),
          "fingerprint", "fp-" + w.id(),
          "last4", w.uanLast4(),
          "status", w.verificationStatus(),
          "avail", w.isAvailable(),
          "lng", w.lng(),
          "lat", w.lat(),
          "rating", w.initialRating(),
          "pmsby", pmsby,
          "pmjjby", pmjjby
      ));

      for (String code : w.skillCategoryCodes()) {
        UUID catId = catMap.get(code);
        if (catId != null) {
          db.update("""
              INSERT INTO worker_skill (worker_id, category_id, verified)
              VALUES (:wid, :cid, :verified)
          """, p("wid", w.id(), "cid", catId, "verified", !isPending));
        }
      }
    }

    // 6. Subservice Map cache
    Map<String, UUID> subMap = db.list("SELECT code, id FROM subservice", Map.of())
        .stream().collect(Collectors.toMap(r -> (String) r.get("code"), r -> (UUID) r.get("id")));

    // Reviews pool for realistic feedback (~60% of completed jobs)
    String[] reviews = new String[] {
        "Arrived on time, fixed the switchboard neatly.",
        "Good work but took 30 mins longer than estimated.",
        "Very polite, cleaned up after work.",
        "Fixed the kitchen sink leakage fast. No unnecessary part replacements.",
        "Prompt cooperative service. Explained the wiring issue clearly before fixing.",
        "Satisfied with the service, very fair cooperative pricing with no middleman commission.",
        "Punctual and skilled technician. Completed the work in less than an hour.",
        "Neat work on the door latch. Very respectful behaviour.",
        "Affordable cooperative rate and no hidden charges. Highly recommended.",
        "Professional attitude. Brought all required plumbing tools.",
        "Great job repairing the ceiling fan capacitor. Running smoothly now.",
        "Excellent home cleaning, very thorough under the sofa and balconies.",
        "Caregiver was extremely attentive and caring with our elderly mother.",
        "Reliable cooperative artisan. Did dampness patching cleanly.",
        "Clear pricing, polite worker, finished the job quickly."
    };

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    int invoiceCounter = 1000;

    // A. Seed Meena's 3 completed historical bookings
    CustomerSeed meena = customers.get(0);
    WorkerSeed arun = workers.get(0);     // Electrical, RS Puram
    WorkerSeed saravanan = workers.get(5); // Plumbing, RS Puram
    WorkerSeed kavitha = workers.get(16);  // Cleaning, RS Puram

    insertCompletedJob(
        meena, arun, subMap.get("switchboard_repair"),
        now.minusDays(21), 500, 575, 75, 5,
        "Arun arrived punctually and repaired our main MCB and switchboard neatly. Very polite and professional.",
        ++invoiceCounter
    );

    insertCompletedJob(
        meena, saravanan, subMap.get("tap_repair"),
        now.minusDays(42), 500, 575, 75, 5,
        "Quickly fixed the kitchen faucet leak with genuine cooperative replacement parts. Transparent pricing.",
        ++invoiceCounter
    );

    insertCompletedJob(
        meena, kavitha, subMap.get("deep_cleaning"),
        now.minusDays(63), 500, 575, 75, 5,
        "Exceptional deep cleaning service! Left our home spotless without any hidden charges.",
        ++invoiceCounter
    );

    // B. Saibaba Colony Plumbing Surge (Weeks 10-12, past 21 days)
    // 40 bookings in Saibaba Colony handled by lone plumber Karthik
    WorkerSeed karthik = workers.get(4); // Plumber in Saibaba Colony
    List<String> plumbingSubservices = List.of("pipe_leakage", "tap_repair", "drain_blockage", "pipe_burst");
    List<String> saibabaAddresses = List.of(
        "18 NSR Road, Saibaba Colony, Coimbatore 641011",
        "42 Alagesan Road, Saibaba Colony, Coimbatore 641011",
        "105 Bharathi Park Road, Saibaba Colony, Coimbatore 641011",
        "27 Kalingarayan Street, Saibaba Colony, Coimbatore 641011",
        "88 Thadagam Road, Saibaba Colony, Coimbatore 641011"
    );

    for (int i = 0; i < 40; i++) {
      // Relative days: spread over last 20 days (higher density in last 7 days)
      int daysAgo = (i < 22) ? (1 + (i % 7)) : (8 + (i % 13));
      int hourOffset = (i * 3) % 10 + 9; // 9am - 7pm
      OffsetDateTime jobTime = now.minusDays(daysAgo).withHour(hourOffset).withMinute((i * 13) % 60);

      String subCode = plumbingSubservices.get(i % plumbingSubservices.size());
      CustomerSeed cust = customers.get(1 + (i % (customers.size() - 1))); // Non-Meena customers
      String address = saibabaAddresses.get(i % saibabaAddresses.size());
      double lat = 11.0298 + ((i % 5) - 2) * 0.0018;
      double lng = 76.9452 + ((i % 5) - 2) * 0.0015;

      int ratingStars = (i % 4 == 0) ? 4 : 5;
      String feedback = (i % 2 == 0) ? reviews[i % reviews.length] : null;

      insertCompletedJobCustom(
          cust.id(), karthik.id(), subMap.get(subCode),
          jobTime, 500, 575, 75, ratingStars, feedback,
          "Saibaba Colony", address, lat, lng,
          ++invoiceCounter
      );
    }

    // C. Other Completed Historical Bookings across Weeks 1 to 12 (~115 jobs)
    // Distributed evenly across remaining trades and societies so other categories remain balanced
    List<WorkerSeed> otherWorkers = workers.subList(0, 24).stream()
        .filter(w -> !w.id().equals(karthik.id()))
        .toList();

    List<String> normalSubservices = List.of(
        "fan_repair", "mcb_wiring", "furniture_assembly", "drilling", "door_repair",
        "wall_painting", "dampness_patching", "touch_up",
        "housekeeping", "bathroom_sanitation", "elderly_care", "patient_assistance",
        "pipe_leakage", "tap_repair"
    );

    for (int i = 0; i < 115; i++) {
      int daysAgo = 1 + (i * 80 / 115); // spread over 1 to 80 days ago
      int hourOffset = (i * 2) % 10 + 9;
      OffsetDateTime jobTime = now.minusDays(daysAgo).withHour(hourOffset).withMinute((i * 17) % 60);

      WorkerSeed w = otherWorkers.get(i % otherWorkers.size());
      String subCode = normalSubservices.get(i % normalSubservices.size());
      UUID subId = subMap.get(subCode);
      if (subId == null) subId = subMap.get("fan_repair");

      CustomerSeed cust = customers.get(1 + (i % (customers.size() - 1)));
      int stars = (i % 7 == 0) ? 4 : ((i % 11 == 0) ? 3 : 5);
      String feedback = (i % 3 != 0) ? reviews[i % reviews.length] : null;

      insertCompletedJobCustom(
          cust.id(), w.id(), subId,
          jobTime, 500, 575, 75, stars, feedback,
          cust.area(), cust.address(), cust.lat(), cust.lng(),
          ++invoiceCounter
      );
    }

    // D. ~16 Cancelled Bookings (~10% cancellation rate across the 12 weeks)
    String[] cancelReasons = new String[] {
        "Customer cancelled: Schedule changed due to personal emergency",
        "Customer cancelled: Issue resolved independently before arrival",
        "Worker cancelled: Vehicle breakdown on the way",
        "Customer cancelled: Required spare parts unavailable today",
        "Customer cancelled: Preferred to reschedule for weekend"
    };

    for (int i = 0; i < 16; i++) {
      int daysAgo = 3 + (i * 75 / 16);
      OffsetDateTime cancelTime = now.minusDays(daysAgo).withHour(11).withMinute(i * 3);
      CustomerSeed cust = customers.get(1 + (i % (customers.size() - 1)));
      WorkerSeed w = workers.get(i % 10);
      String subCode = normalSubservices.get(i % normalSubservices.size());
      UUID subId = subMap.get(subCode);
      if (subId == null) subId = subMap.get("fan_repair");

      insertCancelledJob(cust, w, subId, cancelTime, cancelReasons[i % cancelReasons.length]);
    }

    // E. 4 Active Bookings (so the active dashboard and tracking aren't empty)
    // Active 1: IN_PROGRESS (Murugan Electrician)
    insertActiveJob(
        customers.get(1), workers.get(1), subMap.get("fan_repair"),
        "IN_PROGRESS", now.minusMinutes(45), "Gandhipuram", "45 Cross Cut Road, Gandhipuram, Coimbatore 641012"
    );

    // Active 2: ACCEPTED (Mani Carpenter)
    insertActiveJob(
        customers.get(3), workers.get(9), subMap.get("door_repair"),
        "ACCEPTED", now.minusMinutes(15), "Gandhipuram", "28 East TV Swamy Road, RS Puram, Coimbatore 641002"
    );

    // Active 3: IN_PROGRESS (Revathi Painter)
    insertActiveJob(
        customers.get(5), workers.get(14), subMap.get("dampness_patching"),
        "IN_PROGRESS", now.minusMinutes(30), "RS Puram", "104 100 Feet Road, Gandhipuram, Coimbatore 641012"
    );

    // Active 4: SEARCHING (Unassigned broadcast)
    insertActiveJob(
        customers.get(4), null, subMap.get("deep_cleaning"),
        "SEARCHING", now.minusMinutes(10), "Saibaba Colony", "72 Alagesan Road, Saibaba Colony, Coimbatore 641011"
    );

    // 7. Update Worker Average Ratings accurately from actual ratings table
    db.update("""
        UPDATE worker w
        SET avg_rating = COALESCE(
          (SELECT round(avg(r.stars), 2) FROM rating r WHERE r.worker_id = w.user_id),
          w.avg_rating
        )
    """, Map.of());

    long totalUsers = db.count("SELECT count(*) FROM app_user", Map.of());
    long totalWorkers = db.count("SELECT count(*) FROM worker", Map.of());
    long activeWorkers = db.count("SELECT count(*) FROM worker WHERE verification_status = 'ACTIVE'", Map.of());
    long pendingWorkers = db.count("SELECT count(*) FROM worker WHERE verification_status = 'PENDING_VERIFICATION'", Map.of());
    long totalJobs = db.count("SELECT count(*) FROM job", Map.of());
    long completedJobs = db.count("SELECT count(*) FROM job WHERE status = 'COMPLETED'", Map.of());
    long cancelledJobs = db.count("SELECT count(*) FROM job WHERE status = 'CANCELLED'", Map.of());
    long activeJobs = db.count("SELECT count(*) FROM job WHERE status IN ('SEARCHING','ACCEPTED','IN_PROGRESS')", Map.of());

    log.info("DemoResetService: Completed. Total Users: {}, Workers: {} ({} active, {} pending), Jobs: {} ({} completed, {} cancelled, {} active)",
        totalUsers, totalWorkers, activeWorkers, pendingWorkers, totalJobs, completedJobs, cancelledJobs, activeJobs);

    return Map.of(
        "totalUsers", totalUsers,
        "totalWorkers", totalWorkers,
        "activeWorkers", activeWorkers,
        "pendingWorkers", pendingWorkers,
        "totalJobs", totalJobs,
        "completedJobs", completedJobs,
        "cancelledJobs", cancelledJobs,
        "activeJobs", activeJobs
    );
  }

  private void insertCompletedJob(
      CustomerSeed cust, WorkerSeed w, UUID subserviceId,
      OffsetDateTime time, double basePrice, double grossAmount, double welfare,
      int rating, String feedback, int invoiceNum) {
    insertCompletedJobCustom(
        cust.id(), w.id(), subserviceId, time, basePrice, grossAmount, welfare,
        rating, feedback, cust.area(), cust.address(), cust.lat(), cust.lng(), invoiceNum
    );
  }

  private void insertCompletedJobCustom(
      UUID customerId, UUID workerId, UUID subserviceId,
      OffsetDateTime time, double basePrice, double grossAmount, double welfare,
      int rating, String feedback, String area, String address, double lat, double lng,
      int invoiceNum) {

    UUID quoteId = UUID.randomUUID();
    UUID jobId = UUID.randomUUID();
    UUID paymentId = UUID.randomUUID();
    UUID welfareId = UUID.randomUUID();
    UUID invoiceId = UUID.randomUUID();

    // 1. Quote
    db.update("""
        INSERT INTO quote (id, customer_id, subservice_id, booking_type, base_price, gross_amount, welfare_rate, config_version, expires_at)
        VALUES (:id, :cid, :sid, 'ON_DEMAND', :base, :gross, 0.500, 1, :exp)
    """, p(
        "id", quoteId, "cid", customerId, "sid", subserviceId,
        "base", BigDecimal.valueOf(basePrice), "gross", BigDecimal.valueOf(grossAmount),
        "exp", time.plusHours(1)
    ));

    // 2. Job
    db.update("""
        INSERT INTO job (
          id, customer_id, worker_id, subservice_id, quote_id, booking_type, status,
          service_location, formatted_address, area,
          created_at, updated_at, completed_at,
          allocation_score, dispatch_radius_m, base_price, gross_amount, welfare_rate, config_version,
          idempotency_key, request_hash
        ) VALUES (
          :id, :cid, :wid, :sid, :qid, 'ON_DEMAND', 'COMPLETED',
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :addr, :area,
          :tCreated, :tCompleted, :tCompleted,
          0.92, 15000, :base, :gross, 0.500, 1,
          :idem, :reqHash
        )
    """, p(
        "id", jobId, "cid", customerId, "wid", workerId, "sid", subserviceId, "qid", quoteId,
        "lng", lng, "lat", lat, "addr", address, "area", area,
        "tCreated", time, "tCompleted", time.plusMinutes(45),
        "base", BigDecimal.valueOf(basePrice), "gross", BigDecimal.valueOf(grossAmount),
        "idem", "idem-" + jobId, "reqHash", "hash-" + jobId
    ));

    // 3. Job History
    db.update("""
        INSERT INTO job_history (job_id, actor_id, from_status, to_status, reason, created_at) VALUES
        (:jid, :cid, NULL, 'SEARCHING', 'Job requested by customer', :t1),
        (:jid, :wid, 'SEARCHING', 'ACCEPTED', 'Worker accepted dispatch', :t2),
        (:jid, :wid, 'ACCEPTED', 'IN_PROGRESS', 'Worker arrived at premises and commenced service', :t3),
        (:jid, :wid, 'IN_PROGRESS', 'COMPLETED', 'Service fulfilled successfully and confirmed', :t4)
    """, p(
        "jid", jobId, "cid", customerId, "wid", workerId,
        "t1", time, "t2", time.plusMinutes(2), "t3", time.plusMinutes(12), "t4", time.plusMinutes(45)
    ));

    // 4. Payment (Gross = Worker + Welfare + PlatformFee)
    double surplus = grossAmount - basePrice;
    double workerEarning = grossAmount - welfare;
    db.update("""
        INSERT INTO payment (id, job_id, status, base_price, gross_amount, surplus, welfare_contribution, worker_earning, platform_fee, created_at)
        VALUES (:id, :jid, 'SUCCEEDED', :base, :gross, :surplus, :welfare, :worker, 0, :t)
    """, p(
        "id", paymentId, "jid", jobId,
        "base", BigDecimal.valueOf(basePrice), "gross", BigDecimal.valueOf(grossAmount),
        "surplus", BigDecimal.valueOf(surplus), "welfare", BigDecimal.valueOf(welfare),
        "worker", BigDecimal.valueOf(workerEarning), "t", time.plusMinutes(46)
    ));

    // 5. Welfare Entry
    db.update("""
        INSERT INTO welfare_entry (id, worker_id, payment_id, amount, created_at)
        VALUES (:id, :wid, :pid, :amt, :t)
    """, p(
        "id", welfareId, "wid", workerId, "pid", paymentId,
        "amt", BigDecimal.valueOf(welfare), "t", time.plusMinutes(46)
    ));

    // 6. Invoice
    String invNum = "INV-2026-" + invoiceNum;
    String snapshotJson = String.format(
        java.util.Locale.US,
        "{\"status\":\"PAID\",\"paymentStatus\":\"PAID\",\"baseWage\":%.2f,\"grossAmount\":%.2f,\"surplus\":%.2f,\"welfareContribution\":%.2f,\"workerEarning\":%.2f}",
        basePrice, grossAmount, surplus, welfare, workerEarning
    );
    db.update("""
        INSERT INTO invoice (id, job_id, invoice_number, snapshot, created_at)
        VALUES (:id, :jid, :invNum, CAST(:snap AS jsonb), :t)
    """, p(
        "id", invoiceId, "jid", jobId, "invNum", invNum, "snap", snapshotJson, "t", time.plusMinutes(46)
    ));

    // 7. Rating
    db.update("""
        INSERT INTO rating (job_id, worker_id, stars, feedback, created_at)
        VALUES (:jid, :wid, :stars, :feedback, :t)
    """, p(
        "jid", jobId, "wid", workerId, "stars", rating, "feedback", feedback, "t", time.plusMinutes(50)
    ));
  }

  private void insertCancelledJob(CustomerSeed cust, WorkerSeed w, UUID subserviceId, OffsetDateTime time, String reason) {
    UUID quoteId = UUID.randomUUID();
    UUID jobId = UUID.randomUUID();

    db.update("""
        INSERT INTO quote (id, customer_id, subservice_id, booking_type, base_price, gross_amount, welfare_rate, config_version, expires_at)
        VALUES (:id, :cid, :sid, 'ON_DEMAND', 500, 575, 0.500, 1, :exp)
    """, p("id", quoteId, "cid", cust.id(), "sid", subserviceId, "exp", time.plusHours(1)));

    db.update("""
        INSERT INTO job (
          id, customer_id, worker_id, subservice_id, quote_id, booking_type, status,
          service_location, formatted_address, area,
          created_at, updated_at, completed_at,
          allocation_score, dispatch_radius_m, base_price, gross_amount, welfare_rate, config_version,
          idempotency_key, request_hash
        ) VALUES (
          :id, :cid, :wid, :sid, :qid, 'ON_DEMAND', 'CANCELLED',
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :addr, :area,
          :tCreated, :tCancelled, NULL,
          0.85, 15000, 500, 575, 0.500, 1,
          :idem, :reqHash
        )
    """, p(
        "id", jobId, "cid", cust.id(), "wid", w.id(), "sid", subserviceId, "qid", quoteId,
        "lng", cust.lng(), "lat", cust.lat(), "addr", cust.address(), "area", cust.area(),
        "tCreated", time, "tCancelled", time.plusMinutes(8),
        "idem", "idem-" + jobId, "reqHash", "hash-" + jobId
    ));

    db.update("""
        INSERT INTO job_history (job_id, actor_id, from_status, to_status, reason, created_at) VALUES
        (:jid, :cid, NULL, 'SEARCHING', 'Job requested by customer', :t1),
        (:jid, :cid, 'SEARCHING', 'CANCELLED', :reason, :t2)
    """, p(
        "jid", jobId, "cid", cust.id(), "reason", reason,
        "t1", time, "t2", time.plusMinutes(8)
    ));
  }

  private void insertActiveJob(
      CustomerSeed cust, WorkerSeed w, UUID subserviceId,
      String status, OffsetDateTime time, String area, String address) {

    UUID quoteId = UUID.randomUUID();
    UUID jobId = UUID.randomUUID();
    UUID workerId = (w != null) ? w.id() : null;

    db.update("""
        INSERT INTO quote (id, customer_id, subservice_id, booking_type, base_price, gross_amount, welfare_rate, config_version, expires_at)
        VALUES (:id, :cid, :sid, 'ON_DEMAND', 500, 575, 0.500, 1, :exp)
    """, p("id", quoteId, "cid", cust.id(), "sid", subserviceId, "exp", time.plusHours(2)));

    db.update("""
        INSERT INTO job (
          id, customer_id, worker_id, subservice_id, quote_id, booking_type, status,
          service_location, formatted_address, area,
          created_at, updated_at, completed_at,
          allocation_score, dispatch_radius_m, base_price, gross_amount, welfare_rate, config_version,
          idempotency_key, request_hash
        ) VALUES (
          :id, :cid, :wid, :sid, :qid, 'ON_DEMAND', :status,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :addr, :area,
          :tCreated, :tUpdated, NULL,
          0.90, 15000, 500, 575, 0.500, 1,
          :idem, :reqHash
        )
    """, p(
        "id", jobId, "cid", cust.id(), "wid", workerId, "sid", subserviceId, "qid", quoteId,
        "status", status,
        "lng", cust.lng(), "lat", cust.lat(), "addr", address, "area", area,
        "tCreated", time, "tUpdated", time,
        "idem", "idem-" + jobId, "reqHash", "hash-" + jobId
    ));

    db.update("""
        INSERT INTO job_history (job_id, actor_id, from_status, to_status, reason, created_at)
        VALUES (:jid, :cid, NULL, :status, 'Job state initialized', :t)
    """, p("jid", jobId, "cid", cust.id(), "status", status, "t", time));
  }
}
