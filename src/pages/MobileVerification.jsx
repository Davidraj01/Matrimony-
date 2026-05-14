import React, { useState, useEffect, useRef } from "react";
import API from "../services/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function MobileVerification() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Extract intent globally
  const isReset = searchParams.get("reset") === "true";

  useEffect(() => {
    const isVerified = localStorage.getItem("isVerified");
    // ✅ Only force redirect to dashboard if NOT in reset flow
    if (isVerified === "true" && !isReset) {
      navigate("/dashboard");
    }
  }, [isReset, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      return toast.error("Enter a valid 10-digit phone number");
    }

    try {
      setLoading(true);
      // 💡 BACKEND NOTE: Pass intent so the backend knows not to block verified users
      const res = await API.post("/otp/send", {
        phone: "+91" + phone,
        intent: isReset ? "reset" : "verification",
      });

      toast.success(res.data.message);

      if (res.data.otp) {
        setOtp(res.data.otp.split(""));
      } else {
        setOtp(new Array(6).fill(""));
      }

      setOtpSent(true);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
      setTimer(30);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";

      // ✅ Fix: Only auto-redirect to dashboard if they are NOT resetting a password
      if (msg.toLowerCase().includes("already verified")) {
        if (!isReset) {
          localStorage.setItem("isVerified", "true");
          toast.success("Already verified ✅");
          navigate("/dashboard");
        } else {
          toast.error(
            "Account exists, but OTP failed to send. Check backend logic.",
          );
        }
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const value = element.value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    try {
      setLoading(true);
      const res = await API.post("/otp/verify", {
        phone: "+91" + phone,
        otp: finalOtp,
        intent: isReset ? "reset" : "verification",
      });

      toast.success(res.data.message);

      // ✅ Store verified phone securely for the next step
      localStorage.setItem("verifiedPhone", "+91" + phone);

      if (isReset) {
        navigate("/reset-password");
      } else {
        localStorage.setItem("isVerified", "true");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.isPhoneVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-2">
          {isReset ? "Reset Password" : "Mobile Verification"}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          {isReset
            ? "Verify your number to reset your password"
            : "Verify your mobile number to continue"}
        </p>

        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          disabled={otpSent}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className="w-full border p-2 rounded mb-3 outline-none focus:ring-2 focus:ring-pink-300"
        />

        <button
          onClick={handleSendOTP}
          disabled={loading || timer > 0}
          className={`w-full text-white py-2 rounded mb-4 transition ${
            timer > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {loading
            ? "Sending..."
            : timer > 0
              ? `Resend in ${timer}s`
              : "Send OTP"}
        </button>

        {otpSent && (
          <p className="text-sm text-gray-500 text-center mb-4">
            OTP sent to +91 {phone}
          </p>
        )}

        <div className="flex justify-between gap-2 mb-5">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={data}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center border rounded text-lg outline-none focus:ring-2 focus:ring-pink-300"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full text-white py-2 rounded transition ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Verifying..." : "Verify Mobile"}
        </button>
      </div>
    </div>
  );
}
