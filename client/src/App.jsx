import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import LoanRepaymentDetails from "./assets/Pages/LoanRepaymentDetails";
import LoanRepayments from "./assets/Pages/LoanRepayments";
import Reports from "./assets/Pages/Reports";
import GroupChats from "./assets/Pages/Communication/GroupChats";
import PrivateMessages from "./assets/Pages/Communication/PrivateMessages";
import Announcements from "./assets/Pages/Announcements/Announcements";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* LOGIN */}
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
            <Route path="loan-repayments" element={<LoanRepayments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
            <Route
              path="/dashboard/communication/groups"
              element={<GroupChats />}
            />
            <Route
              path="/dashboard/communication/private"
              element={<PrivateMessages />}
            />
            {/* ✅ FIXED: loanId param route */}
            <Route
              path="loan-repayments/:loanId"
              element={<LoanRepaymentDetails />}
            />
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
