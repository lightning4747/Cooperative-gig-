# 5-Minute SIH Demo Video Script: Natural Walkthrough & Persona Story
### Problem Statement 26089: Cooperative Gig Services Platform for Household & Community Services
**Team:** [Team Name], Dr. Mahalingam College of Engineering and Technology (MCET), Pollachi, Coimbatore

---

## ⏱️ Video Pacing & Outline (5 Minutes / 300 Seconds)

- **0:00 – 0:35** (35s) | **Introduction & The Core Problem** (Phone View: Welcome Screen)
- **0:35 – 0:50** (15s) | **Multilingual Accessibility** (Phone View: Language Switcher)
- **0:50 – 1:25** (35s) | **Worker Registration & Skill Profiling** (Phone View: Worker Signup)
- **1:25 – 1:55** (30s) | **Federation Verification & Consumer Trust** (Desktop View: Federation Queue)
- **1:55 – 2:35** (40s) | **Customer Booking & Wage Floor Transparency** (Phone View: Customer App)
- **2:35 – 3:15** (40s) | **Service Execution & Doorstep Mutual OTP** (Worker & Customer Phone View)
- **3:15 – 3:55** (40s) | **Completion, Invoice Download & Rating** (Customer Phone View)
- **3:55 – 4:25** (30s) | **Worker Passbook & Social Security** (Worker Phone View)
- **4:25 – 4:45** (20s) | **Federation Operations & AI Demand Forecasting** (Desktop View: Admin Console)
- **4:45 – 5:00** (15s) | **Real-World Impact & Humble Closing** (Overview / Presentation View)

---

## 🎬 Minute-by-Minute Script & Screen Navigation

### 0:00 to 0:35 | Intro & The Problem
- **Screen:** Phone view, starting on the app's first screen (`/language` or `/login`).
- **Navigation:** Show the clean landing screen, scrolling gently to show role choices (Customer, Worker, Admin).
- **Spoken Script:**
  > *"Hello everyone. This is the prototype demo video for Smart India Hackathon 2026, problem statement 26089: the Cooperative Gig Services Platform for Household and Community Services. We are Team [Team Name] from Dr. Mahalingam College of Engineering and Technology, Pollachi, Coimbatore.*
  >
  > *Labour cooperatives have thousands of skilled workers—electricians, plumbers, carpenters, and cleaners. But there is no unified digital marketplace for households to connect with them. As a result, private commercial platforms dominate the space, often taking 20% to 30% cuts from worker wages without offering social security. Our platform enables the cooperative to manage this directly while ensuring fair wages and consumer trust. Let us walk you through how it works."*

---

### 0:35 to 0:50 | Multilingual Support
- **Screen:** Phone view, language selection screen (`/language`).
- **Navigation:** Tap the language dropdown or buttons, switch to **தமிழ் (Tamil)**, then show **हिन्दी (Hindi)**, showing labels updating dynamically.
- **Spoken Script:**
  > *"The app works in English, Hindi, and Tamil. A worker or customer can use the whole interface in the language they are most comfortable with, removing language barriers for informal workers across regions."*

---

### 0:50 to 1:25 | Worker Registration & Skill Profiling
- **Screen:** Phone view, worker signup screen (`/register/worker`).
- **Navigation:**
  1. Fill in phone number (`9876543211`) and name (*Ravi*).
  2. Select Primary Cooperative Society (*Coimbatore City Labour Society*).
  3. Select trade category: **Electrical**, pick sub-skills (*Fan Repair, Wiring*).
  4. Submit. Show profile status is marked **PENDING_VERIFICATION**.
- **Spoken Script:**
  > *"First, a worker joins. This is Ravi, an electrician in Coimbatore. He signs up with his mobile number, selects his affiliated Primary Labour Cooperative Society, adds his trade skills, and submits his credentials.*
  >
  > *Notice that his profile is marked as 'Pending Verification'. He cannot take customer jobs yet. This ensures that every worker on the platform is legitimately vetted before entering homes."*

---

### 1:25 to 1:55 | Federation Verification & Trust
- **Screen:** Switch to **Desktop View**, logged in as Federation Admin at `/federation/verification`.
- **Navigation:**
  1. Open the Verification Queue.
  2. Find Ravi’s application in the list.
  3. Inspect his trade and society membership details.
  4. Click the green **Approve Member** button. Status turns to `ACTIVE`.
- **Spoken Script:**
  > *"Now on the federation side. The admin sees Ravi in the verification queue, checks his society membership and trade certifications, and approves him.*
  >
  > *Only verified workers can receive job allocations. That is how the cooperative ensures customer trust and safety from day one."*

---

### 1:55 to 2:35 | Customer Booking & Wage Floor Transparency
- **Screen:** Switch back to Phone view, customer app at `/customer`.
- **Navigation:**
  1. Customer Meena selects **Electrical Services** $\rightarrow$ taps **Fan Repair**.
  2. Address is auto-detected (`/customer/booking/location`).
  3. On `/customer/booking/confirmation`, point to the pricing card:
     - Statutory Base Price: ₹450
     - Transparent Surplus: ₹100
  4. Tap **Confirm Booking**.
- **Spoken Script:**
  > *"Now the customer journey. Meena needs an electrician. She selects Electrical Services and taps Fan Repair. Her location is detected automatically.*
  >
  > *Instead of opaque surge pricing, Meena sees the exact breakdown: the statutory base wage of ₹450 guaranteed to the technician, plus a small ₹100 cooperative surplus.*
  >
  > *When she confirms, our PostGIS dispatch engine selects the best available verified technician in her radius, taking into account distance, customer ratings, and daily workload balance so jobs are distributed fairly."*

---

### 2:35 to 3:15 | Service Execution & Doorstep Mutual OTP
- **Screen:** Worker Phone view (`/worker/jobs`) alongside Customer Phone (`/customer/jobs/:id/tracking`).
- **Navigation:**
  1. Ravi’s phone receives the job offer. He taps **Accept**.
  2. Ravi taps **Start Journey** (`/worker/jobs/:id/travelling`), then **I Have Arrived** (`/worker/jobs/:id/arrival`).
  3. Meena’s phone displays *Worker Arrived* and shows a **Mutual 6-Digit Doorstep OTP** (e.g., `482910`).
  4. Ravi enters the 6-digit OTP on his screen and taps **Verify & Begin**. Status moves to `IN_PROGRESS`.
- **Spoken Script:**
  > *"Ravi receives the request on his phone with the earnings clearly stated. He accepts, starts travelling, and marks 'Arrived' when reaching Meena's home.*
  >
  > *To ensure safety and verify proof of doorstep arrival, the app uses a Mutual 6-Digit OTP. Ravi enters the code displayed on Meena's phone before starting work.*
  >
  > *This prevents false claims, protects both parties, and guarantees the technician is physically present."*

---

### 3:15 to 3:55 | Completion, Invoice Download & Rating
- **Screen:** Customer Phone view (`/customer/jobs/:id/invoice`).
- **Navigation:**
  1. Ravi marks the job complete on his phone.
  2. Meena’s phone immediately loads the digital cooperative invoice.
  3. Show the society registration number, GST/cooperative breakdown, and tap **Download Invoice** to save the PDF.
  4. Meena rates Ravi 5 stars and submits feedback (`/customer/jobs/:id/rating`).
- **Spoken Script:**
  > *"After the repair is done, Ravi marks the job complete. Meena’s screen immediately updates with the certified cooperative invoice, complete with the society registration number and statutory wage details.*
  >
  > *Meena can download the official PDF invoice directly to her phone with one tap.*
  >
  > *She then rates Ravi, which updates his profile and helps the cooperative track service quality across trades."*

---

### 3:55 to 4:25 | Worker Passbook & Social Security
- **Screen:** Worker Phone view at `/worker/passbook`.
- **Navigation:**
  1. Open the Passbook tab.
  2. Point to the ₹450 statutory base wage credited with 0% platform deductions.
  3. Point to the ₹50 surplus credited to Ravi’s individual welfare account.
  4. Highlight the active badges for **PMSBY (Accident)** and **PMJJBY (Life)** insurance schemes.
- **Spoken Script:**
  > *"Looking at Ravi’s passbook, we see the economic core of the cooperative model:*
  >
  > *Ravi receives 100% of his ₹450 statutory base wage—there are zero commission cuts from his base labor. In addition, ₹50 from the booking surplus is deposited into his welfare reserve.*
  >
  > *This surplus automatically funds government social security micro-premiums, specifically PMSBY for ₹2 Lakh accident cover and PMJJBY for life cover, giving Ravi and his family true financial security."*

---

### 4:25 to 4:45 | Federation Dashboard & AI Demand Forecasting
- **Screen:** Switch to **Desktop View** at `/federation` and `/federation/forecast`.
- **Navigation:**
  1. On `/federation`, show the top metrics: Active Workers, Jobs Today, and the Collective Welfare Pool.
  2. Switch to `/federation/forecast`: show the 7-day demand trend and the Trade Capacity Gap matrix (e.g., *Plumbing demand vs. available technicians*).
- **Spoken Script:**
  > *"Back on the Federation Dashboard, the admin monitors everything in one unified view: active workers, daily jobs, and the collective welfare pool balance.*
  >
  > *Under the AI Forecasting tab, the system examines historical booking trends and projects upcoming demand across zones. If an upcoming shortage of plumbers or electricians is detected in an area, the federation can coordinate with local primary societies to balance worker availability and schedule targeted skill training."*

---

### 4:45 to 5:00 | Real-World Impact & Humble Closing
- **Screen:** First screen (`/language` or `/showcase`) or final presentation slide.
- **Navigation:** Calm, steady overview shot.
- **Spoken Script:**
  > *"According to NITI Aayog, India’s gig workforce is projected to reach 2.35 crore workers by 2030, with over 29 crore informal workers already registered on e-Shram.*
  >
  > *Our platform gives labour cooperatives a viable digital path to connect verified workers with households, ensuring fair wages, social protection, and consumer trust under the principle of 'Sahakar Se Samriddhi'.*
  >
  > *Thank you very much."*

---

## 💡 Quick Tips for the Recording

1. **Pre-seeded Accounts for Smooth Navigation:**
   - **Customer:** `9876543210` (Ravi Kumar / Meena)
   - **Worker:** `9876543211` (Arun / Ravi Electrician)
   - **Federation Admin:** `9876543200`
   - *Default OTP:* `123456`
2. **Side-by-Side Setup:** Keep one desktop browser tab for the Federation Admin, and a split mobile viewport (Chrome DevTools Device Mode set to 390×844) for Customer and Worker to make the transitions seamless.
3. **Word Count & Pace:** The voiceover script is ~585 words. Spoken at a natural, unhurried pace of ~120 words/min, it will finish cleanly right at the 5-minute mark.
