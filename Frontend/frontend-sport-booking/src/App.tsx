import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import BookingPage from './features/bookings/pages/BookingPage';
import CourtsPage from './features/courts/pages/CourtsPage';
import OwnerCourtOpsPage from './features/owner/pages/OwnerCourtOpsPage';
import OwnerDashboardPage from './features/owner/pages/OwnerDashboardPage';
import OwnerUsersPage from './features/owner/pages/OwnerUsersPage';
import PaymentPage from './features/payment/pages/PaymentPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import StaffOperationsPage from './features/staff/pages/StaffOperationsPage';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { ROUTES } from './shared/constants/routes';
import { useAuth } from './shared/hooks/useAuth';

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <CourtsPage />;
  }

  if (user.role === 'OWNER') {
    return <Navigate to={ROUTES.ownerDashboard} replace />;
  }

  if (user.role === 'STAFF') {
    return <Navigate to={ROUTES.staffOperations} replace />;
  }

  return <CourtsPage />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.home} element={<HomeRoute />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={`${ROUTES.booking}/:id`} element={<BookingPage />} />
          <Route path={`${ROUTES.payment}/:id`} element={<PaymentPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route path={ROUTES.ownerDashboard} element={<OwnerDashboardPage />} />
          <Route path={ROUTES.ownerUsers} element={<OwnerUsersPage />} />
          <Route path={ROUTES.ownerCourts} element={<OwnerCourtOpsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['OWNER', 'STAFF']} />}>
          <Route path={ROUTES.staffOperations} element={<StaffOperationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;