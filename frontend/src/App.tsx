import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { WorkerLayout } from '@/layouts/WorkerLayout'
import { FederationLayout } from '@/layouts/FederationLayout'

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { WorkerSignUpPage } from '@/pages/auth/WorkerSignUpPage'
import { ShowcasePage } from '@/pages/ShowcasePage'

// Customer Pages
import { CustomerHome } from '@/pages/customer/CustomerHome'
import { ServiceCategoryPage } from '@/pages/customer/ServiceCategoryPage'
import { SubservicePage } from '@/pages/customer/SubservicePage'
import { BookingPage } from '@/pages/customer/BookingPage'
import { CustomerBookingsPage } from '@/pages/customer/CustomerBookingsPage'
import { CustomerInvoicesPage } from '@/pages/customer/CustomerInvoicesPage'
import { LocationPage } from '@/pages/customer/LocationPage'
import { ConfirmationPage } from '@/pages/customer/ConfirmationPage'
import { JobTrackingPage } from '@/pages/customer/JobTrackingPage'
import { OtpPage } from '@/pages/customer/OtpPage'
import { PaymentPage } from '@/pages/customer/PaymentPage'
import { InvoicePage } from '@/pages/customer/InvoicePage'
import { RatingPage } from '@/pages/customer/RatingPage'
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage'

// Worker Pages
import { WorkerDashboard } from '@/pages/worker/WorkerDashboard'
import { PublicWorkerProfilePage } from '@/pages/worker/PublicWorkerProfilePage'
import { WorkerRegisterPage } from '@/pages/worker/WorkerRegisterPage'
import { WorkerVerificationPage } from '@/pages/worker/WorkerVerificationPage'
import { WorkerJobsPage } from '@/pages/worker/WorkerJobsPage'
import { WorkerJobDetailPage } from '@/pages/worker/WorkerJobDetailPage'
import { WorkerTravellingPage } from '@/pages/worker/WorkerTravellingPage'
import { WorkerArrivalPage } from '@/pages/worker/WorkerArrivalPage'
import { WorkerCompletePage } from '@/pages/worker/WorkerCompletePage'

import { WorkerPassbookPage } from '@/pages/worker/WorkerPassbookPage'
import { WorkerInvoicePage } from '@/pages/worker/WorkerInvoicePage'
import { WorkerProfilePage } from '@/pages/worker/WorkerProfilePage'

// Federation Pages
import { FederationDashboard } from '@/pages/federation/FederationDashboard'
import { FederationWorkersPage } from '@/pages/federation/FederationWorkersPage'
import { FederationVerificationPage } from '@/pages/federation/FederationVerificationPage'
import { FederationSocietiesPage } from '@/pages/federation/FederationSocietiesPage'
import { FederationJobsPage } from '@/pages/federation/FederationJobsPage'
import { FederationEmergenciesPage } from '@/pages/federation/FederationEmergenciesPage'
import { FederationAllocationPage } from '@/pages/federation/FederationAllocationPage'
import { FederationWelfarePage } from '@/pages/federation/FederationWelfarePage'
import { FederationForecastPage } from '@/pages/federation/FederationForecastPage'
import { FederationConfigPage } from '@/pages/federation/FederationConfigPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Flow */}
        <Route element={<AuthLayout />}>
          <Route path="/language" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/worker" element={<WorkerSignUpPage />} />
        </Route>

        {/* Phase 2 Showcase preservation */}
        <Route path="/showcase" element={<ShowcasePage />} />

        {/* Public Digital Worker Profile Passport */}
        <Route path="/workers/:workerId" element={<PublicWorkerProfilePage />} />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute role="CUSTOMER" />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/services" element={<ServiceCategoryPage />} />
            <Route path="/customer/services/:categoryId" element={<SubservicePage />} />
            <Route
              path="/customer/services/:categoryId/:serviceId"
              element={<BookingPage />}
            />
            <Route path="/services" element={<ServiceCategoryPage />} />
            <Route path="/services/:categoryId" element={<SubservicePage />} />
            <Route
              path="/services/:categoryId/:serviceId"
              element={<BookingPage />}
            />
            <Route path="/service" element={<ServiceCategoryPage />} />
            <Route path="/service/:categoryId" element={<SubservicePage />} />
            <Route
              path="/service/:categoryId/:serviceId"
              element={<BookingPage />}
            />
            <Route path="/customer/booking/location" element={<LocationPage />} />
            <Route
              path="/customer/booking/confirmation"
              element={<ConfirmationPage />}
            />
            <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
            <Route path="/customer/invoices" element={<CustomerInvoicesPage />} />
            <Route path="/customer/invoices/:jobId" element={<InvoicePage />} />
            <Route path="/customer/jobs/active" element={<Navigate to="/customer/bookings" replace />} />
            <Route
              path="/customer/jobs/:jobId/tracking"
              element={<JobTrackingPage />}
            />
            <Route path="/customer/jobs/:jobId/otp" element={<OtpPage />} />
            <Route path="/customer/jobs/:jobId/payment" element={<PaymentPage />} />
            <Route path="/customer/jobs/:jobId/invoice" element={<InvoicePage />} />
            <Route path="/customer/jobs/:jobId/rating" element={<RatingPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
          </Route>
        </Route>

        {/* Protected Worker Routes */}
        <Route element={<ProtectedRoute role="WORKER" />}>
          <Route element={<WorkerLayout />}>
            <Route path="/worker" element={<WorkerDashboard />} />
            <Route path="/worker/register" element={<WorkerRegisterPage />} />
            <Route
              path="/worker/verification"
              element={<WorkerVerificationPage />}
            />
            <Route path="/worker/jobs" element={<WorkerJobsPage />} />
            <Route path="/worker/schedule" element={<Navigate to="/worker/jobs?tab=schedule" replace />} />
            <Route path="/worker/jobs/:jobId" element={<WorkerJobDetailPage />} />
            <Route
              path="/worker/jobs/:jobId/travelling"
              element={<WorkerTravellingPage />}
            />
            <Route
              path="/worker/jobs/:jobId/arrival"
              element={<WorkerArrivalPage />}
            />
            <Route
              path="/worker/jobs/:jobId/complete"
              element={<WorkerCompletePage />}
            />
            <Route path="/worker/passbook" element={<WorkerPassbookPage />} />
            <Route path="/worker/jobs/:jobId/invoice" element={<WorkerInvoicePage />} />
            <Route path="/worker/earnings" element={<Navigate to="/worker/passbook" replace />} />
            <Route path="/worker/welfare" element={<Navigate to="/worker/passbook?tab=welfare" replace />} />
            <Route path="/worker/profile" element={<WorkerProfilePage />} />
          </Route>
        </Route>

        {/* Protected Federation Admin Routes */}
        <Route element={<ProtectedRoute role="FEDERATION_ADMIN" />}>
          <Route element={<FederationLayout />}>
            <Route path="/federation" element={<FederationDashboard />} />
            <Route path="/federation/workers" element={<FederationWorkersPage />} />
            <Route
              path="/federation/verification"
              element={<FederationVerificationPage />}
            />
            <Route
              path="/federation/societies"
              element={<FederationSocietiesPage />}
            />
            <Route path="/federation/jobs" element={<FederationJobsPage />} />
            <Route
              path="/federation/emergencies"
              element={<FederationEmergenciesPage />}
            />
            <Route
              path="/federation/allocation"
              element={<FederationAllocationPage />}
            />
            <Route path="/federation/welfare" element={<FederationWelfarePage />} />
            <Route
              path="/federation/forecast"
              element={<FederationForecastPage />}
            />
            <Route
              path="/federation/configuration"
              element={<FederationConfigPage />}
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
