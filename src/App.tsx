import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import AddListingPage from './pages/AddListingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ToolsPage from './pages/ToolsPage';
import CollectivePage from './pages/CollectivePage';
import JobPostingPage from './pages/JobPostingPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import SavedProfilesPage from './pages/SavedProfilesPage';
import ComparisonPage from './pages/ComparisonPage';
import MessagingPage from './pages/MessagingPage';
import ConversationPage from './pages/ConversationPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import NewsPage from './pages/NewsPage';
import FAQsPage from './pages/FAQsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import PricingPage from './pages/PricingPage';
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
import SettingsPage from './pages/SettingsPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import OpenRolesPage from './pages/OpenRolesPage';
import AdminJobsPage from './pages/AdminJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ServiceRequestDetailPage from './pages/ServiceRequestDetailPage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<DirectoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
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
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/collective" element={<CollectivePage />} />
          <Route path="/post-job" element={<JobPostingPage />} />
          <Route path="/service-requests" element={<ServiceRequestsPage />} />
          <Route path="/messaging" element={<MessagingPage />} />
          <Route path="/conversation/:id" element={<ConversationPage />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/saved-profiles" element={<SavedProfilesPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/account" element={<AccountManagementPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/open-roles" element={<OpenRolesPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/service-request/:id" element={<ServiceRequestDetailPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
