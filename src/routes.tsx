import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DailyReport from "./pages/DailyReport";
import ProjectEntry from "./pages/ProjectEntry";
import OrderEntry from "./pages/OrderEntry";
import CostSummary from "./pages/CostSummary";
import WageManager from "./pages/WageManager";
import Dashboard from "./pages/Dashboard";


const routes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/daily-report",
    element: (
      <ProtectedRoute>
        <DailyReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/project-entry",
    element: (
      <ProtectedRoute>
        <ProjectEntry />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <OrderEntry />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cost-summary",
    element: (
      <ProtectedRoute>
        <CostSummary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wage-manager",
    element: (
      <ProtectedRoute>
        <WageManager />
      </ProtectedRoute>
    ),
  },
];

export default routes;