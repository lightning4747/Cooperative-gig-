-- Comprehensive Coimbatore Clean and Seed Script

-- 1. Cascade truncate transaction and member tables (preserving category, subservice, allocation_config)
TRUNCATE TABLE 
  welfare_entry,
  payment,
  job_history,
  job_offer,
  audit_log,
  notification,
  auth_session,
  auth_challenge,
  job,
  quote,
  worker_skill,
  worker,
  app_user,
  society,
  federation
CASCADE;

-- 2. Insert Coimbatore District Federation
INSERT INTO federation (id, name, registration_no, state)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Coimbatore District Labour & Services Cooperative Federation',
  'TN-FED-2022-001',
  'Tamil Nadu'
);

-- 3. Insert 4 Coimbatore Cooperative Societies
INSERT INTO society (id, federation_id, name, registration_no, district) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Coimbatore City Labour & Artisans Cooperative Society', 'TN-CBE-2023-011', 'Coimbatore'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'RS Puram Cooperative Workers Union', 'TN-CBE-2023-042', 'Coimbatore'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Peelamedu Cooperative Services Guild', 'TN-CBE-2024-008', 'Coimbatore'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Saibaba Colony Cooperative Labour Guild', 'TN-CBE-2024-025', 'Coimbatore');

-- 4. Core Users: Customer, Federation Admin, and Category Workers
INSERT INTO app_user (id, phone, role, name, preferred_lang) VALUES
('83cf9fc2-33be-4b62-82c6-73396ab41283', '+919876543210', 'CUSTOMER', 'Ravi Kumar', 'en'),
('609085ab-595e-421d-a85e-cfaeb621ab57', '+919876543200', 'ADMIN', 'Federation administrator', 'en'),
('1916482f-a640-4cf8-b486-58fb85e9087e', '+919999999999', 'ADMIN', 'Federation administrator', 'en'),
('bb97f076-d171-48df-9982-68bc3e9cfee5', '+919876543211', 'WORKER', 'Arun Electrician', 'en'),
('a1111111-1111-1111-1111-111111111112', '+919876543212', 'WORKER', 'Karthik Plumber', 'en'),
('a1111111-1111-1111-1111-111111111113', '+919876543213', 'WORKER', 'Selvam Carpenter', 'en'),
('a1111111-1111-1111-1111-111111111114', '+919876543214', 'WORKER', 'Ramu Painter', 'en'),
('a1111111-1111-1111-1111-111111111115', '+919876543215', 'WORKER', 'Kavitha Housekeeping', 'en');

-- 5. Worker Profiles (All in Coimbatore with valid unique UAN fingerprints and active locations)
-- Arun Electrician: Coimbatore City Labour Society (Gandhipuram: 11.0183, 76.9644)
INSERT INTO worker (
  user_id, society_id, membership_id, uan_encrypted, uan_fingerprint, uan_last4,
  certifications, verification_status, verification_note, is_available,
  current_location, location_updated_at, avg_rating, pmsby_status, pmjjby_status
) VALUES (
  'bb97f076-d171-48df-9982-68bc3e9cfee5',
  '00000000-0000-0000-0000-000000000010',
  'MEM-CBE-001',
  'JCtcuO1gueUPAokbyUY4/SYmFQiQA7B5Zthzmlfp2Q+jLpUcbShs7Q==',
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0001',
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
);

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
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0002',
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
);

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
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0003',
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
);

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
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0004',
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
);

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
  '0f3a110b0063fc28170e79f3f14823dd3a8f620734e83448ea422f93f89a0005',
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
);

-- 6. Verified Worker Skills
-- Arun Electrician: Verified across all categories (Electrical focus)
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'bb97f076-d171-48df-9982-68bc3e9cfee5', id, true FROM category;

-- Karthik Plumber: Verified in Plumbing
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111112', id, true FROM category WHERE code = 'plumbing';

-- Selvam Carpenter: Verified in Carpentry
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111113', id, true FROM category WHERE code = 'carpentry';

-- Ramu Painter: Verified in Painting
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111114', id, true FROM category WHERE code = 'painting';

-- Kavitha Housekeeping: Verified in Cleaning and Domestic Help
INSERT INTO worker_skill (worker_id, category_id, verified)
SELECT 'a1111111-1111-1111-1111-111111111115', id, true FROM category WHERE code IN ('cleaning', 'domestic_help');

-- 7. Ensure allocation config is active
INSERT INTO allocation_config (id, version, proximity_weight, rating_weight, load_weight, welfare_rate, emergency_surcharge, standard_radius_m, emergency_radius_m, emergency_timeout_s)
VALUES (1, 1, 0.500, 0.300, 0.200, 0.500, 0.00, 15000, 10000, 60)
ON CONFLICT (id) DO UPDATE SET
  standard_radius_m = 15000,
  emergency_radius_m = 10000;
