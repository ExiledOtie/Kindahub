import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./assets/Context/AuthContext";
import ProtectedRoute from "./assets/Routes/ProtectedRoutes";

import Login from "./assets/Application/Login";

import DashboardLayout from "./assets/Layout/DashboardLayout";

import Dashboard from "./assets/Application/Dashboard";
import UserDashboard from "./assets/Application/UserDashboard";
import Members from "./assets/Pages/Members";
import Contributions from "./assets/Pages/Contributions";
import Loans from "./assets/Pages/Loans";
import MemberProfile from "./assets/Pages/MemberProfile";
import ProfileTab from "./assets/Pages/MemberTabs/ProfileTab";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="loans" element={<Loans />} />
            <Route path="members/:id" element={<MemberProfile />} />
            <Route path="profile" element={<ProfileTab />} />
          </Route>

          {/* USER ROUTES */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout role="user" />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;