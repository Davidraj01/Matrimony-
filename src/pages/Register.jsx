import React, { useState, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { registerUser } from "../services/authApi";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import loginimg from "../assets/login-img.png";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" }); // ✅ important

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await registerUser(data);
      toast.success("Account created successfully 🎉");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "User exists") {
        toast.error("Email already registered. Try login.");
      } else {
        console.log(err.response?.data);
        toast.error(msg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* LEFT */}
        <div className="hidden md:flex md:w-[45%] bg-[#701a28] text-white p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-white p-1.5 rounded-lg">
                <Heart className="text-[#701a28] fill-[#701a28]" size={20} />
              </div>
              <span className="font-bold text-xl">Royal Matrimony</span>
            </div>

            <h1 className="text-4xl font-serif leading-tight">
              Start Your Journey <br />
              <span className="text-yellow-400">to Forever</span>
            </h1>
            <img src={loginimg} alt="matrimony illustration image" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-[55%] p-8 md:p-14">
          <h2 className="text-2xl font-bold mb-6">Create Account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* NAME + MOBILE */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label="Full Name"
                icon={<User size={18} />}
                error={errors.name}
                {...register("name", {
                  required: "Full name is required",
                  minLength: { value: 3, message: "Min 3 characters" },
                })}
              />

              <FloatingInput
                label="Mobile"
                icon={<Phone size={18} />}
                error={errors.phone}
                {...register("phone", {
                  required: "Mobile required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter valid 10-digit number",
                  },
                })}
              />
            </div>

            {/* EMAIL */}
            <FloatingInput
              label="Email"
              icon={<Mail size={18} />}
              error={errors.email}
              {...register("email", {
                required: "Email required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email",
                },
              })}
            />

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label="Password"
                type={showPass ? "text" : "password"}
                icon={<Lock size={18} />}
                error={errors.password}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...register("password", {
                  required: "Password required",
                  minLength: {
                    value: 6,
                    message: "Min 6 characters",
                  },
                })}
              />

              <FloatingInput
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                icon={<Lock size={18} />}
                error={errors.confirmPassword}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...register("confirmPassword", {
                  required: "Confirm password",
                  validate: (val) =>
                    val === password || "Passwords do not match",
                })}
              />
            </div>

            {/* GENDER */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="I am a"
                error={errors.gender}
                {...register("gender", {
                  required: "Select gender",
                })}
                options={["Male", "Female"]}
              />

              <Select
                label="Looking for"
                {...register("lookingFor")}
                options={["Bride", "Groom"]}
              />
            </div>

            {/* DATE + LOCATION */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                type="date"
                icon={<Calendar size={18} />}
                {...register("dob")}
              />

              <FloatingInput
                label="Location"
                icon={<MapPin size={18} />}
                error={errors.location}
                {...register("location", {
                  required: "Location required",
                })}
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-12 bg-pink-500 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-500 font-bold">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// INPUT COMPONENT
const FloatingInput = forwardRef(
  ({ label, icon, error, type = "text", rightIcon, ...props }, ref) => (
    <div>
      <div className="flex items-center border rounded-xl px-3 h-12 bg-gray-50">
        {icon}
        <input
          ref={ref}
          {...props}
          type={type}
          placeholder={label}
          className="ml-2 w-full bg-transparent outline-none"
        />
        {rightIcon}
      </div>
      {error && <p className="text-red-500 text-xs">{error.message}</p>}
    </div>
  ),
);

// SELECT COMPONENT
const Select = forwardRef(({ label, options, error, ...props }, ref) => (
  <div>
    <select
      ref={ref}
      {...props}
      className="w-full border rounded-xl px-4 h-12 bg-gray-50"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt.toLowerCase()}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs">{error.message}</p>}
  </div>
));
