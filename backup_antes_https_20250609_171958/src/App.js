import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CompareProvider } from './contexts/CompareContext';
// Páginas principales
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import RequestPasswordResetPage from './pages/Auth/RequestPasswordResetPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VehiclesPage from './pages/Vehicles/VehiclesPage';
import VehicleDetailPage from './pages/Vehicles/VehicleDetailPage';
import ComparisonPage from './pages/Comparison/ComparisonPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminVehicleListPage from './pages/Admin/AdminVehicleListPage';
import AdminVehicleFormPage from './pages/Admin/AdminVehicleFormPage';
import MyListsPage from './pages/User/MyListsPage';
import ListDetailPage from './pages/User/ListDetailPage';
import FavoritesPage from './pages/User/FavoritesPage';
import ProfilePage from './pages/User/ProfilePage';
// Páginas estáticas
import AboutPage from './pages/Static/AboutPage';
import ContactPage from './pages/Static/ContactPage';
import PrivacyPage from './pages/Static/PrivacyPage';
import TermsPage from './pages/Static/TermsPage';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Layout>
        <Routes>
              {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/:id_vehiculo" element={<VehicleDetailPage />} />
          <Route path="/compare" element={<ComparisonPage />} />

              {/* Rutas de autenticación */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Rutas de administrador */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true} redirectTo="/">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/vehicles" element={
                <ProtectedRoute adminOnly={true} redirectTo="/">
                  <AdminVehicleListPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/vehicles/new" element={
                <ProtectedRoute adminOnly={true} redirectTo="/">
                  <AdminVehicleFormPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/vehicles/edit/:id" element={
                <ProtectedRoute adminOnly={true} redirectTo="/">
                  <AdminVehicleFormPage />
                </ProtectedRoute>
              } />

              {/* Rutas de usuario autenticado */}
              <Route path="/my-lists" element={
                <ProtectedRoute>
                  <MyListsPage />
                </ProtectedRoute>
              } />
              <Route path="/my-lists/:id_lista" element={
                <ProtectedRoute>
                  <ListDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Páginas estáticas */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
          </Layout>
      </Router>
      </CompareProvider>
    </AuthProvider>
  );
}

export default App;
