// src/App.jsx

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./assets/Application/Login";
import Dashboard from "./assets/Application/Dashboard";

import ProtectedRoute from "./assets/Routes/ProtectedRoutes";
import { AuthProvider } from "./assets/Context/AuthContext";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;