import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exceptions from './pages/Exceptions';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Import the Global Copilot
import Copilot from './components/Copilot';

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-[#030509] relative">
        
        {/* Global Copilot Component - Always accessible */}
        <Copilot />

        <Routes>
          {/* Public / Entry Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />

          {/* Core Enterprise Application Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exceptions" element={<Exceptions />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}