import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import PageTransition from './components/PageTransition';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import AddListingPage from './pages/AddListingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdvertisementsPage from './pages/AdvertisementsPage';
import CollectivePage from './pages/CollectivePage';
import JobPostingPage from './pages/JobPostingPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import SavedProfilesPage from './pages/SavedProfilesPage';
import ComparisonPage from './pages/ComparisonPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import NewsPage from './pages/NewsPage';
import FAQsPage from './pages/FAQsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AccountManagementPage from './pages/AccountManagementPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminContentPage from './pages/AdminContentPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import MyProfilePage from './pages/MyProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SettingsPage from './pages/SettingsPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import OpenRolesPage from './pages/OpenRolesPage';
import AdminJobsPage from './pages/AdminJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ServiceRequestDetailPage from './pages/ServiceRequestDetailPage';
import RecognitionPage from './pages/RecognitionPage';
import EventsPage from './pages/EventsPage';
import SearchPage from './pages/SearchPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/AdminApplicationDetailPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import AdminNewsletterPage from './pages/AdminNewsletterPage';
import AdminRecognitionPage from './pages/AdminRecognitionPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminEventDetailPage from './pages/AdminEventDetailPage';
import EventSubmissionPage from './pages/EventSubmissionPage';
import EventDetailPage from './pages/EventDetailPage';
import UserDashboard from './pages/UserDashboard';
import RegistrationPendingPage from './pages/RegistrationPendingPage';
import ArticlePage from './pages/ArticlePage';
import SponsorshipPage from './pages/SponsorshipPage';
import EmailBlastPage from './pages/EmailBlastPage';
import AdminSponsorshipsPage from './pages/AdminSponsorshipsPage';
import AdminEmailBlastsPage from './pages/AdminEmailBlastsPage';
import CookieConsent from './components/CookieConsent';

function AppRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition>
      <CookieConsent />
      <Routes location={location}>
          <Route path="/" element={<DirectoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/my-profile/edit" element={<EditProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/add-listing" element={<AddListingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/advertisements" element={<AdvertisementsPage />} />
          <Route path="/collective" element={<CollectivePage />} />
          <Route path="/post-job" element={<JobPostingPage />} />
          <Route path="/service-requests" element={<ServiceRequestsPage />} />
          <Route path="/messaging" element={<Navigate to="/collective" replace />} />
          <Route path="/conversation/:id" element={<Navigate to="/collective" replace />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/saved-profiles" element={<SavedProfilesPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/pricing" element={<Navigate to="/advertisements" replace />} />
          <Route path="/account" element={<AccountManagementPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/open-roles" element={<OpenRolesPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/service-request/:id" element={<ServiceRequestDetailPage />} />
          <Route path="/recognition" element={<RecognitionPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
          <Route path="/admin/newsletter" element={<AdminNewsletterPage />} />
          <Route path="/admin/articles" element={<AdminArticlesPage />} />
          <Route path="/admin/recognition" element={<AdminRecognitionPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/event/:id" element={<AdminEventDetailPage />} />
          <Route path="/submit-event" element={<EventSubmissionPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/registration-pending" element={<RegistrationPendingPage />} />
          <Route path="/sponsorship" element={<SponsorshipPage />} />
          <Route path="/email-blast" element={<EmailBlastPage />} />
          <Route path="/admin/sponsorships" element={<AdminSponsorshipsPage />} />
          <Route path="/admin/email-blasts" element={<AdminEmailBlastsPage />} />
        </Routes>
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
