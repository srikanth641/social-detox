import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { RootLayout } from './layouts/RootLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { FocusRoomsPage } from './pages/FocusRoomsPage';
import { FriendsPage } from './pages/FriendsPage';
import { FaqPage } from './pages/FaqPage';
import { ErrorsPage } from './pages/ErrorsPage';
import { HealthPage } from './pages/HealthPage';
import { SupportPage } from './pages/SupportPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="focus-rooms" element={<FocusRoomsPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="errors" element={<ErrorsPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="500" element={<ServerErrorPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
