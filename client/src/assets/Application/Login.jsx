// src/Pages/Login.jsx

import React, { useState, useContext } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { AuthContext } from "../Context/AuthContext";
import landingImage from "../Images/landing.png";

const Login = () => {
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await login(formData);

    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message || "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#f4f8f4] overflow-hidden">

      {/* MAIN GRID */}
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[65%_35%]">

        {/* LEFT SIDE IMAGE */}
        <div className="hidden lg:block relative h-full overflow-hidden">

          <img
            src={landingImage}
            alt="Sacco"
            className="w-full h-full object-cover scale-105"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/25"></div>

        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex items-center justify-center bg-white h-full overflow-y-auto px-6 lg:px-10">

          {/* REDUCED FORM WIDTH */}
          <div className="w-full max-w-sm">

            {/* HEADER */}
            <div className="text-center mb-10">

              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-4xl">💰</span>
              </div>

              <h2 className="text-4xl font-bold text-green-700">
                Welcome Back
              </h2>

              <p className="text-gray-500 mt-3 text-base">
                Login to your SACCO account
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>

                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Email
                </label>

                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-green-600">

                  <FaUser className="text-gray-400 mr-3 text-base" />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent text-gray-700 outline-none"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Password
                </label>

                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-3 transition-all duration-300 focus-within:ring-2 focus-within:ring-green-600">

                  <FaLock className="text-gray-400 mr-3 text-base" />

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent text-gray-700 outline-none"
                  />

                </div>

              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-green-700 hover:underline font-medium"
                >
                  Forgot Password?
                </button>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 transition-all duration-300 text-white py-3 rounded-2xl font-semibold shadow-lg text-base"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            {/* FOOTER */}
            <div className="mt-10 text-center">

              <p className="text-gray-500 text-sm">
                SACCO Management System
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;