// src/Context/AuthContext.jsx

import { createContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

// ✅ CORRECT IMPORT
import api from "../Utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);

    localStorage.setItem("token", res.data.token);

    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    navigate("/dashboard");
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK STORED USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
