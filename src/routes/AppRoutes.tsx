import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetails from "../pages/PatientDetails";
import Expenses from "../pages/Expenses";
import Settings from "../pages/Settings";
import DashboardLayout from "../components/layouts/DashboardLayout";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
        path="/"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />

        <Route path="/patients" element={<Patients />} />

        <Route
          path="/patients/:patientId"
          element={<PatientDetails />}
        />

        <Route path="/expenses" element={<Expenses />} />

        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;