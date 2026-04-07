import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import LandingPage from '@/pages/LandingPage';
import NextSeasonPage from '@/pages/NextSeasonPage';
import RegisterPage from '@/pages/RegisterPage';
import FeedPage from '@/pages/FeedPage';
import InventoryPage from '@/pages/InventoryPage';
import ProfilePage from '@/pages/ProfilePage';
import EditProfilePage from '@/pages/EditProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/next-season" element={<NextSeasonPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
