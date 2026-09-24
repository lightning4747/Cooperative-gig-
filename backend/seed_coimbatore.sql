-- Coimbatore Data Seed Script
-- Purge all legacy multi-area jobs, offers, challenges, and transactions
DELETE FROM job_event;
DELETE FROM job_history;
DELETE FROM job_offer;
DELETE FROM doorstep_challenge;
DELETE FROM payment;
DELETE FROM welfare_entry;
DELETE FROM job_rating;
DELETE FROM notification;
DELETE FROM audit_log;
DELETE FROM job;
DELETE FROM quote;
DELETE FROM auth_session;
DELETE FROM auth_challenge;

-- Clean worker skills and workers
DELETE FROM worker_skill;
DELETE FROM worker;

-- Remove test users other than demo accounts
DELETE FROM app_user;

-- Remove old societies
DELETE FROM society;
DELETE FROM federation;

-- 1. Insert Coimbatore District Federation
INSERT INTO federation (id, name, registration_no, state)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Coimbatore District Labour & Services Cooperative Federation',
  'TN-FED-2022-001',
  'Tamil Nadu'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  registration_no = EXCLUDED.registration_no,
  state = EXCLUDED.state;

-- 2. Insert 4 Coimbatore Cooperative Societies
INSERT INTO society (id, federation_id, name, registration_no, district) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Coimbatore City Labour & Artisans Cooperative Society', 'TN-CBE-2023-011', 'Coimbatore'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'RS Puram Cooperative Workers Union', 'TN-CBE-2023-042', 'Coimbatore'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Peelamedu Cooperative Services Guild', 'TN-CBE-2024-008', 'Coimbatore'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Saibaba Colony Cooperative Labour Guild', 'TN-CBE-2024-025', 'Coimbatore')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  registration_no = EXCLUDED.registration_no,
  district = EXCLUDED.district;

-- 3. Core Users: Customer, Federation Admin, and Category Workers
INSERT INTO app_user (id, phone, role, name) VALUES
('83cf9fc2-33be-4b62-82c6-73396ab41283', '+919876543210', 'CUSTOMER', 'Ravi Kumar'),
('609085ab-595e-421d-a85e-cfaeb621ab57', '+919876543200', 'ADMIN', 'Federation administrator'),
('1916482f-a640-4cf8-b486-58fb85e9087e', '+919999999999', 'ADMIN', 'Federation administrator'),
('bb97f076-d171-48df-9982-68bc3e9cfee5', '+919876543211', 'WORKER', 'Arun'),
('a1111111-1111-1111-1111-111111111112', '+919876543212', 'WORKER', 'Karthik Plumber'),
('a1111111-1111-1111-1111-111111111113', '+919876543213', 'WORKER', 'Selvam Carpenter'),
('a1111111-1111-1111-1111-111111111114', '+919876543214', 'WORKER', 'Ramu Painter'),
('a1111111-1111-1111-1111-111111111115', '+919876543215', 'WORKER', 'Kavitha Housekeeping')
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  name = EXCLUDED.name;

-- 4. Worker Profiles (All in Coimbatore, active, available, enrolled in social security)
-- Arun: Coimbatore City Labour Society (Gandhipuram: 11.0183, 76.9644)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'bb97f076-d171-48df-9982-68bc3e9cfee5',
  '00000000-0000-0000-0000-000000000010',
  'MEM-CBE-001',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff51',
  '9011',
  '["Skill India Certified - Senior Electrician Grade A"]'::jsonb,
  'ACTIVE',
  'Verified credentials and membership compliance in good order.',
  true,
  ST_SetSRID(ST_MakePoint(76.9644, 11.0183), 4326)::geography,
  now(),
  4.950,
  'ENROLLED',
  'ENROLLED'
) ON CONFLICT (user_id) DO UPDATE SET
  society_id = EXCLUDED.society_id,
  membership_id = EXCLUDED.membership_id,
  is_available = true,
  verification_status = 'ACTIVE',
  current_location = EXCLUDED.current_location,
  location_updated_at = now(),
  avg_rating = 4.950;

-- Karthik Plumber: RS Puram Cooperative Workers Union (RS Puram: 11.0088, 76.9482)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'a1111111-1111-1111-1111-111111111112',
  '00000000-0000-0000-0000-000000000011',
  'MEM-CBE-002',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff52',
  '9012',
  '["Cooperative Certified Master Plumber"]'::jsonb,
  'ACTIVE',
  'Verified credentials and membership compliance in good order.',
  true,
  ST_SetSRID(ST_MakePoint(76.9482, 11.0088), 4326)::geography,
  now(),
  4.900,
  'ENROLLED',
  'ENROLLED'
) ON CONFLICT (user_id) DO UPDATE SET
  society_id = EXCLUDED.society_id,
  membership_id = EXCLUDED.membership_id,
  is_available = true,
  verification_status = 'ACTIVE',
  current_location = EXCLUDED.current_location,
  location_updated_at = now(),
  avg_rating = 4.900;

-- Selvam Carpenter: Peelamedu Cooperative Services Guild (Peelamedu: 11.0267, 77.0055)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'a1111111-1111-1111-1111-111111111113',
  '00000000-0000-0000-0000-000000000012',
  'MEM-CBE-003',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff53',
  '9013',
  '["Cooperative Certified Specialist Carpenter"]'::jsonb,
  'ACTIVE',
  'Verified credentials and membership compliance in good order.',
  true,
  ST_SetSRID(ST_MakePoint(77.0055, 11.0267), 4326)::geography,
  now(),
  4.850,
  'ENROLLED',
  'ENROLLED'
) ON CONFLICT (user_id) DO UPDATE SET
  society_id = EXCLUDED.society_id,
  membership_id = EXCLUDED.membership_id,
  is_available = true,
  verification_status = 'ACTIVE',
  current_location = EXCLUDED.current_location,
  location_updated_at = now(),
  avg_rating = 4.850;

-- Ramu Painter: Saibaba Colony Cooperative Labour Guild (Saibaba Colony: 11.0298, 76.9452)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'a1111111-1111-1111-1111-111111111114',
  '00000000-0000-0000-0000-000000000013',
  'MEM-CBE-004',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff54',
  '9014',
  '["Cooperative Certified Lead Painter"]'::jsonb,
  'ACTIVE',
  'Verified credentials and membership compliance in good order.',
  true,
  ST_SetSRID(ST_MakePoint(76.9452, 11.0298), 4326)::geography,
  now(),
  4.800,
  'ENROLLED',
  'ENROLLED'
) ON CONFLICT (user_id) DO UPDATE SET
  society_id = EXCLUDED.society_id,
  membership_id = EXCLUDED.membership_id,
  is_available = true,
  verification_status = 'ACTIVE',
  current_location = EXCLUDED.current_location,
  location_updated_at = now(),
  avg_rating = 4.800;

-- Kavitha Housekeeping: Coimbatore City Labour Society (Gandhipuram: 11.0150, 76.9700)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'a1111111-1111-1111-1111-111111111115',
  '00000000-0000-0000-0000-000000000010',
  'MEM-CBE-005',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89aff55',
  '9015',
  '["Cooperative Certified Sanitation Specialist"]'::jsonb,
  'ACTIVE',
  'Verified credentials and membership compliance in good order.',
  true,
  ST_SetSRID(ST_MakePoint(76.9700, 11.0150), 4326)::geography,
  now(),
  4.900,
  'ENROLLED',
  'ENROLLED'
) ON CONFLICT (user_id) DO UPDATE SET
  society_id = EXCLUDED.society_id,
  membership_id = EXCLUDED.membership_id,
  is_available = true,
  verification_status = 'ACTIVE',
  current_location = EXCLUDED.current_location,
  location_updated_at = now(),
  avg_rating = 4.900;

-- 5. Worker Skills Mapping
-- Arun: Verified in Electrical and all categories
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'bb97f076-d171-48df-9982-68bc3e9cfee5', id, true FROM category
ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;

-- Karthik Plumber: Verified in Plumbing
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111112', id, true FROM category WHERE code = 'plumbing'
ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;

-- Selvam Carpenter: Verified in Carpentry
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111113', id, true FROM category WHERE code = 'carpentry'
ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;

-- Ramu Painter: Verified in Painting
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111114', id, true FROM category WHERE code = 'painting'
ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;

-- Kavitha Housekeeping: Verified in Cleaning and Domestic Help
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111115', id, true FROM category WHERE code IN ('cleaning', 'domestic_help')
ON CONFLICT (worker_id, category_id) DO UPDATE SET verified = true;
