// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./assets/Application/Login";

// Admin Dashboard
import Dashboard from "./assets/Application/Dashboard";

// User Dashboard
import UserDashboard from "./assets/Application/UserDashboard";

// App Pages
import Members from "./assets/Pages/Members";

import ProtectedRoute from "./assets/Routes/ProtectedRoutes";

import { AuthProvider } from "./assets/Context/AuthContext";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Members Page */}
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
