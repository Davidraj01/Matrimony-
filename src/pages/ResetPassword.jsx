import { useState, useEffect } from "react";
import API from "../services/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  // ✅ Route Protection: Ensure they arrived here legally via OTP
  useEffect(() => {
    const phone = localStorage.getItem("verifiedPhone");
    if (!phone) {
      toast.error("Unauthorized access. Please verify your mobile first.");
      navigate("/mobileverify?reset=true");
    }
  }, [navigate]);

  const handleReset = async () => {
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const phone = localStorage.getItem("verifiedPhone");

      await API.post("/auth/reset-password", {
        phone,
        password,
      });

      toast.success("Password updated successfully!");
      localStorage.removeItem("verifiedPhone");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-4 outline-none focus:ring-2 focus:ring-pink-300"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-3 rounded mb-4 outline-none focus:ring-2 focus:ring-pink-300"
        />

        <button
          onClick={handleReset}
          className="w-full bg-pink-500 hover:bg-pink-600 transition text-white py-3 rounded font-semibold"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
