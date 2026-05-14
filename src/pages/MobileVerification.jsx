import React, { useState, useEffect, useRef } from "react";
import API from "../services/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function MobileVerification() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isReset = params.get("reset");

    const isVerified = localStorage.getItem("isVerified");

    // ✅ Only redirect if NOT reset password flow
    if (isVerified === "true" && isReset !== "true") {
      navigate("/dashboard");
    }
  }, []);
  // =========================================
  // ⏳ TIMER
  // =========================================
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // =========================================
  // 📩 SEND OTP
  // =========================================
  const handleSendOTP = async () => {
    // ✅ VALIDATION
    if (!phone || phone.length !== 10) {
      return toast.error("Enter valid phone number");
    }

    try {
      setLoading(true);

      const res = await API.post("/otp/send", {
        phone: "+91" + phone,
      });

      toast.success(res.data.message);

      // ✅ DEV MODE AUTOFILL (only if backend sends otp)
      if (res.data.otp) {
        setOtp(res.data.otp.split(""));
      } else {
        setOtp(new Array(6).fill(""));
      }

      setOtpSent(true);

      // ✅ AUTO FOCUS FIRST OTP BOX
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);

      // ✅ START TIMER
      setTimer(30);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";

      // ✅ already verified
      if (msg.toLowerCase().includes("already verified")) {
        localStorage.setItem("isVerified", "true");

        toast.success("Already verified ✅");

        navigate("/dashboard");

        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // 🔢 OTP INPUT CHANGE
  // =========================================
  const handleChange = (element, index) => {
    // ✅ ONLY NUMBERS
    if (isNaN(element.value)) return;

    const value = element.value.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // ✅ AUTO NEXT FOCUS
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // =========================================
  // ⌫ BACKSPACE SUPPORT
  // =========================================
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // =========================================
  // ✅ VERIFY OTP
  // =========================================
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    // ✅ VALIDATION
    if (finalOtp.length !== 6) {
      return toast.error("Enter valid OTP");
    }

    try {
      setLoading(true);

      const res = await API.post("/otp/verify", {
        phone: "+91" + phone,
        otp: finalOtp,
      });

      toast.success(res.data.message);

      // ✅ STORE VERIFIED FLAG
      localStorage.setItem("isVerified", "true");

      // ✅ UPDATE USER OBJECT ALSO
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        user.isPhoneVerified = true;

        localStorage.setItem("user", JSON.stringify(user));
      }

      // ✅ REDIRECT
      const params = new URLSearchParams(window.location.search);

      const isReset = params.get("reset");
      // ✅ STORE VERIFIED PHONE
      localStorage.setItem("verifiedPhone", "+91" + phone);
      if (isReset === "true") {
        navigate("/reset-password");
      } else {
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
        {/* TITLE */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Mobile Verification
        </h2>

        <p className="text-sm text-gray-500 text-center mb-5">
          Verify your mobile number to continue
        </p>

        {/* 📱 PHONE INPUT */}
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

        {/* 📩 SEND OTP BUTTON */}
        <button
          onClick={handleSendOTP}
          disabled={loading || timer > 0}
          className={`w-full text-white py-2 rounded mb-4 transition
            ${
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

        {/* ℹ️ INFO */}
        {otpSent && (
          <p className="text-sm text-gray-500 text-center mb-4">
            OTP sent to +91 {phone}
          </p>
        )}

        {/* 🔢 OTP INPUTS */}
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

        {/* ✅ VERIFY BUTTON */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full text-white py-2 rounded transition
            ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
        >
          {loading ? "Verifying..." : "Verify Mobile"}
        </button>
      </div>
    </div>
  );
}
