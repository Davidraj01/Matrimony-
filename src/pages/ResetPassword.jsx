import { useState, useEffect } from "react";
import API from "../services/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const phone = localStorage.getItem("verifiedPhone");

    if (!phone) {
      navigate("/mobileverify?reset=true");
    }
  }, []);

  const handleReset = async () => {
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }

    try {
      const phone = localStorage.getItem("verifiedPhone");

      await API.post("/auth/reset-password", {
        phone,
        password,
      });

      toast.success("Password updated");

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
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

        <button
          onClick={handleReset}
          className="w-full bg-pink-500 text-white py-3 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
