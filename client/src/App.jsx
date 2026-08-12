import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./assets/Context/AuthContext";
import ProtectedRoute from "./assets/Routes/ProtectedRoutes";

import Login from "./assets/Application/Login";

import DashboardLayout from "./assets/Layout/DashboardLayout";

import Dashboard from "./assets/Application/Dashboard";
import UserDashboard from "./assets/Application/UserDashboard";

// ==========================================
// ADMIN PAGES
// ==========================================

import Members from "./assets/Pages/Admin/Members";
import Contributions from "./assets/Pages/Admin/Contributions";
import Loans from "./assets/Pages/Admin/Loans";
import MemberProfile from "./assets/Pages/Admin/MemberProfile";
import ProfileTab from "./assets/Pages/Admin/MemberTabs/ProfileTab";
import LoanRepaymentDetails from "./assets/Pages/Admin/LoanRepaymentDetails";
import Savings from "./assets/Pages/Admin/Savings";
import LoanRepayments from "./assets/Pages/Admin/LoanRepayments";
import Reports from "./assets/Pages/Admin/Reports";
import Wallet from "./assets/Pages/Admin/Wallet";

// ==========================================
// USER PAGES
// ==========================================

import UserContributions from "./assets/Pages/Users/UserContributions";
import UserSavings from "./assets/Pages/Users/UserSavings";
import UserLoans from "./assets/Pages/Users/UserLoans";
import UserPayments from "./assets/Pages/Users/userPayments";
import Statements from "./assets/Pages/Users/Statements";

import UserGroupChats from "./assets/Pages/Users/Communication/UserGroupChats";
import UserPrivateMessages from "./assets/Pages/Users/Communication/UserPrivateMessages";

import UserNotifications from "./assets/Pages/Users/UserNotifications";

// IMPORTANT
import UserWallet from "./assets/Pages/Users/UserWallet";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ==========================================
              LOGIN
          ========================================== */}

          <Route path="/" element={<Login />} />


          {/* ==========================================
              ADMIN ROUTES
          ========================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >

            <Route index element={<Dashboard />} />

            <Route
              path="members"
              element={<Members />}
            />

            <Route
              path="contributions"
              element={<Contributions />}
            />

            <Route
              path="loans"
              element={<Loans />}
            />

            <Route
              path="members/:id"
              element={<MemberProfile />}
            />

            <Route
              path="profile"
              element={<ProfileTab />}
            />

            <Route
              path="loan-repayments"
              element={<LoanRepayments />}
            />

            <Route
              path="loan-repayments/:loanId"
              element={<LoanRepaymentDetails />}
            />

            <Route
              path="savings"
              element={<Savings />}
            />

            <Route
              path="wallet-deposits"
              element={<Wallet />}
            />

            <Route
              path="reports"
              element={<Reports />}
            />

            <Route
              path="announcements"
              element={<Announcements />}
            />

            <Route
              path="notifications"
              element={<Notifications />}
            />

            {/* ADMIN COMMUNICATION */}

            <Route
              path="communication/groups"
              element={<GroupChats />}
            />

            <Route
              path="communication/private"
              element={<PrivateMessages />}
            />

          </Route>


          {/* ==========================================
            USER ROUTES
          ========================================== */}

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout role="user" />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<UserDashboard />}
            />

            <Route
              path="contributions"
              element={<UserContributions />}
            />

            <Route
              path="savings"
              element={<UserSavings />}
            />

            <Route
              path="loans"
              element={<UserLoans />}
            />

            <Route
              path="payments"
              element={<UserPayments />}
            />

            <Route
              path="statements"
              element={<Statements />}
            />

            {/* USER COMMUNICATION */}

            <Route
              path="communication/groups"
              element={<UserGroupChats />}
            />

            <Route
              path="communication/private"
              element={<UserPrivateMessages />}
            />

            {/* USER NOTIFICATIONS */}

            <Route
              path="notifications"
              element={<UserNotifications />}
            />

            {/* USER WALLET */}

            <Route
              path="wallet"
              element={<UserWallet />}
            />

            <Route
              path="wallet-deposits"
              element={<UserWalletDeposits />}
            />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;