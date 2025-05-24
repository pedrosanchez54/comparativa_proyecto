import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
=======
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// Páginas principales
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
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

function App() {
  return (
    <AuthProvider>
      <Router>
<<<<<<< HEAD
        <ToastContainer position="top-right" autoClose={3000} />
=======
>>>>>>> d12e99e75d65bd37337c1913d67ec765620ce445
        {/* Layout básico, puedes personalizarlo después */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/:id_vehiculo" element={<VehicleDetailPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          {/* Admin (solo admin) */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute adminOnly={true}><AdminVehicleListPage /></ProtectedRoute>} />
          <Route path="/admin/vehicles/new" element={<ProtectedRoute adminOnly={true}><AdminVehicleFormPage /></ProtectedRoute>} />
          <Route path="/admin/vehicles/edit/:id" element={<ProtectedRoute adminOnly={true}><AdminVehicleFormPage /></ProtectedRoute>} />
          {/* Usuario (solo autenticado) */}
          <Route path="/my-lists" element={<ProtectedRoute><MyListsPage /></ProtectedRoute>} />
          <Route path="/my-lists/:id_lista" element={<ProtectedRoute><ListDetailPage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
