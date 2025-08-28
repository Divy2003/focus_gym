import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Diets from './pages/admin/Diets';
import DietPlanForm from './pages/admin/DietPlanForm';
import Login from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="diets" element={<Diets />} />
          <Route path="diets/new" element={<DietPlanForm />} />
          <Route path="diets/edit/:id" element={<DietPlanForm />} />
        </Route>
      </Route>

      {/* You can add other routes here, for example, a 404 page */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default App;