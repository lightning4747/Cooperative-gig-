CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE federation (id uuid PRIMARY KEY, name text NOT NULL, registration_no text NOT NULL UNIQUE, state text NOT NULL);
CREATE TABLE society (id uuid PRIMARY KEY, federation_id uuid NOT NULL REFERENCES federation, name text NOT NULL, registration_no text NOT NULL UNIQUE, district text NOT NULL);
CREATE TABLE app_user (
 id uuid PRIMARY KEY, phone varchar(16) NOT NULL UNIQUE, role text NOT NULL CHECK (role IN ('CUSTOMER','WORKER','ADMIN')),
 name varchar(100) NOT NULL, preferred_lang varchar(2) NOT NULL DEFAULT 'en' CHECK (preferred_lang IN ('en','hi','ta')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_challenge (
 id uuid PRIMARY KEY, phone varchar(16) NOT NULL, code_hash text NOT NULL, attempts int NOT NULL DEFAULT 0,
 expires_at timestamptz NOT NULL, consumed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_phone_created ON auth_challenge(phone, created_at);
CREATE TABLE auth_session (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_user, family_id uuid NOT NULL, token_hash text NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL, used boolean NOT NULL DEFAULT false, revoked boolean NOT NULL DEFAULT false
);
CREATE INDEX auth_session_family ON auth_session(family_id);
CREATE TABLE category (id uuid PRIMARY KEY, code text NOT NULL UNIQUE, name text NOT NULL);
CREATE TABLE subservice (
 id uuid PRIMARY KEY, category_id uuid NOT NULL REFERENCES category, code text NOT NULL UNIQUE, name text NOT NULL,
 description text NOT NULL, base_price numeric(12,2) NOT NULL CHECK (base_price>0), duration_minutes int NOT NULL CHECK (duration_minutes>0),
 emergency_supported boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true
);
CREATE TABLE worker (
 user_id uuid PRIMARY KEY REFERENCES app_user, society_id uuid NOT NULL REFERENCES society, membership_id varchar(80) NOT NULL,
 uan_encrypted text NOT NULL, uan_fingerprint text NOT NULL UNIQUE, uan_last4 varchar(4) NOT NULL, certifications jsonb NOT NULL DEFAULT '[]',
 verification_status text NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN ('PENDING_VERIFICATION','ACTIVE','REJECTED','SUSPENDED')),
 verification_note text, is_available boolean NOT NULL DEFAULT false, current_location geography(Point,4326), location_updated_at timestamptz,
 avg_rating numeric(4,3) NOT NULL DEFAULT 3 CHECK (avg_rating BETWEEN 1 AND 5),
 pmsby_status text NOT NULL DEFAULT 'NOT_ENROLLED' CHECK (pmsby_status IN ('NOT_ENROLLED','PENDING','ENROLLED')),
 pmjjby_status text NOT NULL DEFAULT 'NOT_ENROLLED' CHECK (pmjjby_status IN ('NOT_ENROLLED','PENDING','ENROLLED')),
 UNIQUE(society_id,membership_id)
);
CREATE INDEX worker_location_gist ON worker USING gist(current_location);
CREATE TABLE worker_skill (worker_id uuid REFERENCES worker, category_id uuid REFERENCES category, verified boolean NOT NULL DEFAULT false, PRIMARY KEY(worker_id,category_id));
CREATE TABLE allocation_config (
 id int PRIMARY KEY CHECK (id=1), version int NOT NULL DEFAULT 1,
 proximity_weight numeric(4,3) NOT NULL CHECK (proximity_weight BETWEEN 0 AND 1), rating_weight numeric(4,3) NOT NULL CHECK (rating_weight BETWEEN 0 AND 1), load_weight numeric(4,3) NOT NULL CHECK (load_weight BETWEEN 0 AND 1),
 welfare_rate numeric(4,3) NOT NULL CHECK (welfare_rate BETWEEN 0 AND 1), emergency_surcharge numeric(12,2) NOT NULL CHECK (emergency_surcharge>=0),
 standard_radius_m int NOT NULL CHECK (standard_radius_m BETWEEN 100 AND 50000), emergency_radius_m int NOT NULL CHECK (emergency_radius_m BETWEEN 100 AND 20000),
 emergency_timeout_s int NOT NULL CHECK (emergency_timeout_s BETWEEN 60 AND 90),
 CHECK (proximity_weight+rating_weight+load_weight=1)
);
CREATE TABLE quote (
 id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES app_user, subservice_id uuid NOT NULL REFERENCES subservice,
 booking_type text NOT NULL CHECK (booking_type IN ('STANDARD','ON_DEMAND','EMERGENCY')),
 base_price numeric(12,2) NOT NULL, gross_amount numeric(12,2) NOT NULL, welfare_rate numeric(4,3) NOT NULL, config_version int NOT NULL,
 expires_at timestamptz NOT NULL, CHECK (gross_amount>=base_price)
);
CREATE TABLE job (
 id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES app_user, worker_id uuid REFERENCES worker(user_id), subservice_id uuid NOT NULL REFERENCES subservice,
 quote_id uuid NOT NULL UNIQUE REFERENCES quote, booking_type text NOT NULL CHECK (booking_type IN ('STANDARD','ON_DEMAND','EMERGENCY')),
 status text NOT NULL CHECK (status IN ('SEARCHING','OFFERED','BROADCAST','ACCEPTED','TRAVELLING','ARRIVED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED')),
 service_location geography(Point,4326) NOT NULL, formatted_address varchar(500) NOT NULL, area varchar(100) NOT NULL,
 scheduled_time timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 offer_deadline timestamptz, otp_encrypted text, otp_hash text, otp_expires_at timestamptz, otp_attempts int NOT NULL DEFAULT 0,
 allocation_score double precision, allocation_breakdown jsonb, dispatch_radius_m int NOT NULL,
 base_price numeric(12,2) NOT NULL, gross_amount numeric(12,2) NOT NULL, welfare_rate numeric(4,3) NOT NULL, config_version int NOT NULL,
 idempotency_key varchar(100) NOT NULL, request_hash text NOT NULL, retry_count int NOT NULL DEFAULT 0,
 CHECK (gross_amount>=base_price), CHECK (booking_type<>'STANDARD' OR scheduled_time IS NOT NULL),
 UNIQUE(customer_id,idempotency_key)
);
CREATE UNIQUE INDEX one_active_job_per_worker ON job(worker_id) WHERE status IN ('ACCEPTED','TRAVELLING','ARRIVED','IN_PROGRESS');
CREATE INDEX job_dispatch ON job(status,scheduled_time,offer_deadline);
CREATE INDEX job_customer ON job(customer_id,created_at DESC);
CREATE INDEX job_worker ON job(worker_id,created_at DESC);
CREATE INDEX job_location_gist ON job USING gist(service_location);
CREATE TABLE job_offer (
 job_id uuid REFERENCES job, worker_id uuid REFERENCES worker(user_id), status text NOT NULL CHECK (status IN ('PENDING','ACCEPTED','DECLINED','EXPIRED','TAKEN')),
 score double precision, breakdown jsonb, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(job_id,worker_id)
);
CREATE TABLE job_history (id bigserial PRIMARY KEY, job_id uuid NOT NULL REFERENCES job, actor_id uuid REFERENCES app_user, from_status text, to_status text NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE manual_dispatch (id uuid PRIMARY KEY, job_id uuid NOT NULL REFERENCES job, worker_id uuid NOT NULL REFERENCES worker(user_id), admin_id uuid NOT NULL REFERENCES app_user, method varchar(100) NOT NULL, note varchar(1000) NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE payment (
 id uuid PRIMARY KEY, job_id uuid NOT NULL UNIQUE REFERENCES job, status text NOT NULL CHECK (status IN ('SIMULATED_SUCCEEDED','SUCCEEDED')),
 base_price numeric(12,2) NOT NULL, gross_amount numeric(12,2) NOT NULL, surplus numeric(12,2) NOT NULL,
 welfare_contribution numeric(12,2) NOT NULL, worker_earning numeric(12,2) NOT NULL, platform_fee numeric(12,2) NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK (surplus=gross_amount-base_price), CHECK (surplus>=0),
 CHECK (welfare_contribution BETWEEN 0 AND surplus), CHECK (worker_earning>=base_price), CHECK (worker_earning+welfare_contribution+platform_fee=gross_amount)
);
CREATE TABLE welfare_entry (id uuid PRIMARY KEY, worker_id uuid NOT NULL REFERENCES worker(user_id), payment_id uuid NOT NULL UNIQUE REFERENCES payment, amount numeric(12,2) NOT NULL CHECK (amount>=0), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE invoice (id uuid PRIMARY KEY, job_id uuid NOT NULL UNIQUE REFERENCES job, invoice_number text NOT NULL UNIQUE, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE rating (job_id uuid PRIMARY KEY REFERENCES job, worker_id uuid NOT NULL REFERENCES worker(user_id), stars int NOT NULL CHECK (stars BETWEEN 1 AND 5), feedback varchar(2000), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE notification (id bigserial PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_user, type text NOT NULL, job_id uuid REFERENCES job, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX notification_user_cursor ON notification(user_id,id);
CREATE TABLE audit_log (id bigserial PRIMARY KEY, actor_id uuid REFERENCES app_user, action text NOT NULL, entity_id text NOT NULL, details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
