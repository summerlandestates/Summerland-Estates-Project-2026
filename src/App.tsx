import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DirectoryPage />} />
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
      </Routes>
    </Router>
  );
}

export default App;
