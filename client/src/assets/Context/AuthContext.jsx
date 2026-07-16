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

    const user = res.data.user;

    sessionStorage.setItem("token", res.data.token);

    sessionStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    if (user.role === "super_admin" || user.is_super_admin) {
      navigate("/dashboard");
    } else {
      navigate("/user-dashboard");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK STORED USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

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
