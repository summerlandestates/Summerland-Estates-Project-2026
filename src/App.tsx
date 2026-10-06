import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import PageTransition from './components/PageTransition';
import CookieConsent from './components/CookieConsent';
import AdminLayout from './components/AdminLayout';
import SEOHead from './components/SEOHead';

// Landing & core auth pages stay eager for fast first paint.
import DirectoryPage from './pages/DirectoryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Everything else lazy-loads on first navigation.
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AddListingPage = lazy(() => import('./pages/AddListingPage'));
const AdvertisementsPage = lazy(() => import('./pages/AdvertisementsPage'));
const CollectivePage = lazy(() => import('./pages/CollectivePage'));
const JobPostingPage = lazy(() => import('./pages/JobPostingPage'));
const ServiceRequestsPage = lazy(() => import('./pages/ServiceRequestsPage'));
const SavedProfilesPage = lazy(() => import('./pages/SavedProfilesPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContentPageView = lazy(() => import('./pages/ContentPageView'));
const MyArticlesPage = lazy(() => import('./pages/MyArticlesPage'));
const AccountManagementPage = lazy(() => import('./pages/AccountManagementPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminContentPage = lazy(() => import('./pages/AdminContentPage'));
const AdminContentPageEditor = lazy(() => import('./pages/AdminContentPageEditor'));
const UpgradePlansPage = lazy(() => import('./pages/UpgradePlansPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const OpenRolesPage = lazy(() => import('./pages/OpenRolesPage'));
const AdminJobsPage = lazy(() => import('./pages/AdminJobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const ServiceRequestDetailPage = lazy(() => import('./pages/ServiceRequestDetailPage'));
const RecognitionPage = lazy(() => import('./pages/RecognitionPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminApplicationsPage = lazy(() => import('./pages/AdminApplicationsPage'));
const AdminApplicationDetailPage = lazy(() => import('./pages/AdminApplicationDetailPage'));
const AdminArticlesPage = lazy(() => import('./pages/AdminArticlesPage'));
const AdminNewsletterPage = lazy(() => import('./pages/AdminNewsletterPage'));
const AdminRecognitionPage = lazy(() => import('./pages/AdminRecognitionPage'));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminEventDetailPage = lazy(() => import('./pages/AdminEventDetailPage'));
const EventSubmissionPage = lazy(() => import('./pages/EventSubmissionPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ConversationsPage = lazy(() => import('./pages/ConversationsPage'));
const RegistrationPendingPage = lazy(() => import('./pages/RegistrationPendingPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const SponsorshipPage = lazy(() => import('./pages/SponsorshipPage'));
const EmailBlastPage = lazy(() => import('./pages/EmailBlastPage'));
const AdminSponsorshipsPage = lazy(() => import('./pages/AdminSponsorshipsPage'));
const AdminEmailBlastsPage = lazy(() => import('./pages/AdminEmailBlastsPage'));
const AdminPromoCodesPage = lazy(() => import('./pages/AdminPromoCodesPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-[#A89F91] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Wraps private/auth pages so they never inherit stale indexable head tags.
function Private({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SEOHead title={title} description={`${title} - Summerland Estates member area.`} noIndex />
      {children}
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition>
      <CookieConsent />
      <Suspense fallback={<RouteLoader />}>
      <Routes location={location}>
          <Route path="/" element={<DirectoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<Private title="Verify Email"><VerifyEmailPage /></Private>} />
          <Route path="/auth/callback" element={<Private title="Signing In"><AuthCallbackPage /></Private>} />
          <Route path="/forgot-password" element={<Private title="Forgot Password"><ForgotPasswordPage /></Private>} />
          <Route path="/reset-password" element={<Private title="Reset Password"><ResetPasswordPage /></Private>} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/my-profile/edit" element={<Private title="Edit Profile"><EditProfilePage /></Private>} />
          <Route path="/my-articles" element={<MyArticlesPage />} />
          <Route path="/settings" element={<Private title="Settings"><SettingsPage /></Private>} />
          <Route path="/admin/login" element={<Private title="Admin Sign In"><AdminLoginPage /></Private>} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Private title="Admin: Admin Dashboard"><AdminDashboard /></Private>} />
            <Route path="/admin/users" element={<Private title="Admin: Manage Users"><AdminUsersPage /></Private>} />
            <Route path="/admin/content" element={<Private title="Admin: Content Pages"><AdminContentPage /></Private>} />
            <Route path="/admin/content/pages/:id" element={<Private title="Admin: Edit Page"><AdminContentPageEditor /></Private>} />
            <Route path="/admin/settings" element={<Private title="Admin: Admin Settings"><AdminSettingsPage /></Private>} />
          </Route>
          <Route path="/profile/:slug" element={<ProfilePage />} />
          <Route path="/add-listing" element={<AddListingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/advertisements" element={<AdvertisementsPage />} />
          <Route path="/collective" element={<CollectivePage />} />
          <Route path="/post-job" element={<JobPostingPage />} />
          <Route path="/service-requests" element={<ServiceRequestsPage />} />
          <Route path="/messaging" element={<Private title="Messages"><ConversationsPage /></Private>} />
          <Route path="/messaging/:id" element={<Private title="Messages"><ConversationsPage /></Private>} />
          <Route path="/conversation/:id" element={<Private title="Conversation"><ConversationsPage /></Private>} />
          <Route path="/notification-settings" element={<Private title="Notification Settings"><NotificationSettingsPage /></Private>} />
          <Route path="/notifications" element={<Private title="Notifications"><NotificationsPage /></Private>} />
          <Route path="/saved-profiles" element={<Private title="Saved Profiles"><SavedProfilesPage /></Private>} />
          <Route path="/compare" element={<Private title="Compare Profiles"><ComparisonPage /></Private>} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/pages/:slug" element={<ContentPageView />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<UpgradePlansPage />} />
          <Route path="/upgrade" element={<UpgradePlansPage />} />
          <Route path="/account" element={<Private title="Account"><AccountManagementPage /></Private>} />
          <Route path="/payment-success" element={<Private title="Payment Complete"><PaymentSuccessPage /></Private>} />
          <Route path="/checkout" element={<Private title="Checkout"><CheckoutPage /></Private>} />
          <Route path="/open-roles" element={<OpenRolesPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/service-request/:id" element={<ServiceRequestDetailPage />} />
          <Route path="/recognition" element={<RecognitionPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/jobs" element={<Private title="Admin: Manage Jobs"><AdminJobsPage /></Private>} />
            <Route path="/admin/applications" element={<Private title="Admin: Applications"><AdminApplicationsPage /></Private>} />
            <Route path="/admin/applications/:id" element={<Private title="Admin: Application Detail"><AdminApplicationDetailPage /></Private>} />
            <Route path="/admin/newsletter" element={<Private title="Admin: Newsletter"><AdminNewsletterPage /></Private>} />
            <Route path="/admin/articles" element={<Private title="Admin: Manage Articles"><AdminArticlesPage /></Private>} />
            <Route path="/admin/recognition" element={<Private title="Admin: Recognition"><AdminRecognitionPage /></Private>} />
            <Route path="/admin/events" element={<Private title="Admin: Manage Events"><AdminEventsPage /></Private>} />
            <Route path="/admin/event/:id" element={<Private title="Admin: Event Detail"><AdminEventDetailPage /></Private>} />
            <Route path="/admin/reports" element={<Private title="Admin: Reports"><AdminReportsPage /></Private>} />
          </Route>
          <Route path="/submit-event" element={<EventSubmissionPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/registration-pending" element={<Private title="Registration Pending"><RegistrationPendingPage /></Private>} />
          <Route path="/sponsorship" element={<SponsorshipPage />} />
          <Route path="/email-blast" element={<EmailBlastPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/sponsorships" element={<Private title="Admin: Sponsorships"><AdminSponsorshipsPage /></Private>} />
            <Route path="/admin/email-blasts" element={<Private title="Admin: Email Blasts"><AdminEmailBlastsPage /></Private>} />
            <Route path="/admin/promo-codes" element={<Private title="Admin: Promo Codes"><AdminPromoCodesPage /></Private>} />
          </Route>
        </Routes>
      </Suspense>
      </PageTransition>
    );
  }

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
