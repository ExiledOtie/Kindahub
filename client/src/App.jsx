// src/App.jsx

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

import ProtectedRoute from "./Routes/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";

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