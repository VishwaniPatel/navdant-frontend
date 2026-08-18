import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetails from "../pages/PatientDetails";
import Expenses from "../pages/Expenses";
import Settings from "../pages/Settings";
import DashboardLayout from "../components/layouts/DashboardLayout";
import CategoryExpenses from "../components/CategoryExpenses";
import DoctorManagement from "../pages/DoctorManagement";
import Reports from "../pages/Reports";
import PatientRegistration from "../pages/PatientRegistration";


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

                <Route
                    path="/doctors"
                    element={<DoctorManagement />}
                />

                <Route
  path="/patients/register"
  element={<PatientRegistration />}
/>

                <Route path="/expenses" element={<Expenses />} />

                <Route path="/settings" element={<Settings />} />
                <Route
                    path="/expenses/category/:category"
                    element={<CategoryExpenses />}
                />
                <Route path="/reports" element={<Reports />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;