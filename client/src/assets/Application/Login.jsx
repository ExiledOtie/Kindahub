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

      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative h-full overflow-hidden">

          <img
            src={landingImage}
            alt="Sacco"
            className="w-full h-full object-cover"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* CONTENT */}
          <div className="absolute inset-0 flex flex-col justify-end p-14 z-10 text-white">

            <h1 className="text-6xl font-bold leading-tight drop-shadow-lg">
              Loan & Savings
              <br />
              made simple
            </h1>

            <p className="mt-5 text-xl text-gray-100 max-w-lg leading-relaxed">
              Save regularly. Borrow wisely.
              Build a better tomorrow with your trusted SACCO platform.
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center bg-white h-full overflow-y-auto px-6 md:px-16">

          <div className="w-full max-w-md">

            {/* HEADER */}
            <div className="text-center mb-10">

              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span className="text-5xl">💰</span>
              </div>

              <h2 className="text-5xl font-bold text-green-700">
                Welcome Back
              </h2>

              <p className="text-gray-500 mt-3 text-lg">
                Login to your SACCO account
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* EMAIL */}
              <div>

                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Email
                </label>

                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-green-600">

                  <FaUser className="text-gray-400 mr-3 text-lg" />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent text-gray-700"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Password
                </label>

                <div className="flex items-center border border-gray-300 rounded-2xl px-4 py-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-green-600">

                  <FaLock className="text-gray-400 mr-3 text-lg" />

                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent text-gray-700"
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

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 transition-all duration-300 text-white py-4 rounded-2xl font-semibold shadow-lg text-lg"
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