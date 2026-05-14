import { useState } from "react";
import { loginUser } from "../services/authApi";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      // ✅ normalize response
      const token = res.data?.token || res.token;
      const user = res.data?.user || res.user;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      localStorage.clear();
      // ✅ store properly
      localStorage.setItem("userId", user._id);
      localStorage.setItem("token", token);
      localStorage.setItem("plan", user.subscription || "free");
      localStorage.setItem("user", JSON.stringify(user));

      console.log("LOGIN USER:", user);
      console.log("PHONE VERIFIED:", user.isPhoneVerified);
      // ✅ redirect based on phone verification
      if (!user.isPhoneVerified) {
        navigate("/mobileverify");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Authentication failed. Please check your credentials.";

      console.error("[Login Error]:", err);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* LEFT SIDE */}
        <div className="hidden md:flex md:w-1/2 bg-[#701a28] text-white p-12 flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="text-[#701a28] fill-[#701a28]" size={20} />
              Royal Matrimony
            </h1>

            <div className="mt-20">
              <h2 className="text-4xl font-serif leading-tight">
                Find Your Perfect <br />
                <span className="text-yellow-400">Life Partner</span>
              </h2>

              <p className="mt-4 text-gray-300">
                Trusted by millions. Start your journey to a happy married life.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold">100%</p>
              <p className="text-gray-400">Verified Profiles</p>
            </div>

            <div>
              <p className="font-bold">10M+</p>
              <p className="text-gray-400">Happy Matches</p>
            </div>

            <div>
              <p className="font-bold">Privacy</p>
              <p className="text-gray-400">Our Priority</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>

            <p className="text-gray-500 text-sm">
              Login to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 size-5" />

                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 size-5" />

                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/mobileverify?reset=true")}
                className="text-sm text-pink-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e94e77] hover:bg-[#d43d66] text-white font-semibold py-3 rounded-lg transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* SIGNUP */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-pink-600 font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
