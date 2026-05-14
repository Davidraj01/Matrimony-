import { useState } from "react";
import API from "../services/axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/forgot-password", {
        email,
      });

      toast.success("Reset link sent to email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>

        <p className="text-gray-500 text-sm mb-5">
          Enter your registered email
        </p>

        <input
          type="email"
          required
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-3 rounded-lg"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
