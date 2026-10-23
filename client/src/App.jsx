import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./auth/AuthContext.jsx";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminTicketDetail from "./pages/AdminTicketDetail.jsx";
import AdminTicketQueue from "./pages/AdminTicketQueue.jsx";
import AuthorDashboard from "./pages/AuthorDashboard.jsx";
import AuthorBooks from "./pages/AuthorBooks.jsx";
import AuthorTicketDetail from "./pages/AuthorTicketDetail.jsx";
import AuthorTickets from "./pages/AuthorTickets.jsx";
import CreateTicket from "./pages/CreateTicket.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { getHomePath } from "./utils/format.js";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={getHomePath(user)} replace />;
}

function LoginRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={getHomePath(user)} replace /> : <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute role="author" />}>
        <Route element={<AppShell />}>
          <Route path="/author" element={<AuthorDashboard />} />
          <Route path="/author/books" element={<AuthorBooks />} />
          <Route path="/author/tickets" element={<AuthorTickets />} />
          <Route path="/author/tickets/new" element={<CreateTicket />} />
          <Route path="/author/tickets/:ticketId" element={<AuthorTicketDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppShell />}>
          <Route path="/admin/tickets" element={<AdminTicketQueue />} />
          <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
