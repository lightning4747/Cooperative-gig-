#!/usr/bin/env bash
set -e

echo "=== Seeding Cooperative Gig Demo Data ==="

# Check if docker container is running
if docker ps --format '{{.Names}}' | grep -q "cooperativegig-db"; then
  DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep "cooperativegig-db" | head -n 1)
  echo "Found database container: $DB_CONTAINER"
  docker exec -i "$DB_CONTAINER" psql -U cooperative -d cooperative << 'EOF'
-- Safe idempotent demo seed script

-- 1. App Users (creates or updates without hardcoded conflicting UUIDs)
INSERT INTO app_user (id, phone, role, name, preferred_lang)
VALUES
  (gen_random_uuid(), '+919876543210', 'CUSTOMER', 'Ravi Kumar', 'en'),
  (gen_random_uuid(), '+919876543211', 'WORKER', 'Arun Electrician', 'en'),
  (gen_random_uuid(), '+919876543220', 'WORKER', 'Pooja Sharma', 'en'),
  (gen_random_uuid(), '+919876543225', 'WORKER', 'Vijay Plumber', 'en'),
  (gen_random_uuid(), '+919999999999', 'ADMIN', 'Federation administrator', 'en')
ON CONFLICT (phone) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- 2. Worker Profiles using the actual user_id from app_user
DO $$
DECLARE
  v_society_id uuid;
  v_arun_id uuid;
  v_pooja_id uuid;
  v_vijay_id uuid;
BEGIN
  SELECT id INTO v_society_id FROM society LIMIT 1;
  SELECT id INTO v_arun_id FROM app_user WHERE phone = '+919876543211';
  SELECT id INTO v_pooja_id FROM app_user WHERE phone = '+919876543220';
  SELECT id INTO v_vijay_id FROM app_user WHERE phone = '+919876543225';

  IF v_arun_id IS NOT NULL THEN
    INSERT INTO worker (
      user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
      certifications, verification_status, verification_note, is_available,
      current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
    )
    VALUES (
      v_arun_id, v_society_id, 'MEM-CH-999', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
      '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff54', '9012',
      '["Cooperative Certified Grade A"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
      true, ST_SetSRID(ST_MakePoint(77.621, 12.934), 4326)::geography, now(), 5.000,
      'ENROLLED', 'ENROLLED'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      is_available = true,
      verification_status = 'ACTIVE',
      current_location = ST_SetSRID(ST_MakePoint(77.621, 12.934), 4326)::geography,
      location_updated_at = now();

    -- Verify all skills for Arun
    INSERT INTO worker_skill (worker_id, category_id, verified)
    SELECT v_arun_id, id, true FROM category
    ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;
  END IF;

  IF v_pooja_id IS NOT NULL THEN
    INSERT INTO worker (
      user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
      certifications, verification_status, verification_note, is_available,
      current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
    )
    VALUES (
      v_pooja_id, v_society_id, 'MEM-CH-101', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
      '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff55', '1011',
      '["Cooperative Certified"]'::jsonb, 'ACTIVE', 'Verified credentials in order',
      true, ST_SetSRID(ST_MakePoint(77.635, 12.928), 4326)::geography, now(), 4.800,
      'ENROLLED', 'ENROLLED'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      is_available = true,
      verification_status = 'ACTIVE',
      current_location = ST_SetSRID(ST_MakePoint(77.635, 12.928), 4326)::geography,
      location_updated_at = now();

    INSERT INTO worker_skill (worker_id, category_id, verified)
    SELECT v_pooja_id, id, true FROM category WHERE name IN ('Electrical', 'Cleaning', 'Domestic Help', 'Caregiving')
    ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;
  END IF;

  IF v_vijay_id IS NOT NULL THEN
    INSERT INTO worker (
      user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
      certifications, verification_status, verification_note, is_available,
      current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
    )
    VALUES (
      v_vijay_id, v_society_id, 'MEM-CH-102', 'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
      '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff56', '1022',
      '["Apprentice Plumbing"]'::jsonb, 'PENDING_VERIFICATION', 'Awaiting certificate validation',
      false, ST_SetSRID(ST_MakePoint(77.610, 12.940), 4326)::geography, now(), 4.500,
      'NOT_ENROLLED', 'NOT_ENROLLED'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO worker_skill (worker_id, category_id, verified)
    SELECT v_vijay_id, id, false FROM category WHERE name = 'Plumbing'
    ON CONFLICT (worker_id, category_id) DO NOTHING;
  END IF;
END $$;
EOF
  echo "Demo data successfully seeded into $DB_CONTAINER."
else
  echo "Error: Database container is not running. Please start with 'docker compose up -d' first."
  exit 1
fi
