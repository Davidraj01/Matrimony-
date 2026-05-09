import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axios";
import MatchCard from "../components/MatchCard";
import { COLORS } from "../../utils/colors";
import { Heart, Sparkles, Star, Flower2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const [filters, setFilters] = useState({
    minAge: "",
    maxAge: "",
    location: "",
    religion: "",
    gender: "",
  });

  const navigate = useNavigate();

  // =========================================
  // 🚀 INITIAL LOAD
  // =========================================
  useEffect(() => {
    fetchUser();
  }, []);

  // =========================================
  // 👤 FETCH USER
  // =========================================
  const fetchUser = async () => {
    try {
      const res = await API.get("/profile/me");

      const user = res.data.userId;
      const profile = res.data;

      const valid =
        user?.subscription === "premium" &&
        user?.premiumExpires &&
        new Date(user.premiumExpires) > new Date();

      setIsPremium(valid);

      // 🔥 APPLY PREFERENCES TO FILTERS
      const pref = profile.preferences || {};

      const updatedFilters = {
        minAge: pref.ageRange?.min || "",
        maxAge: pref.ageRange?.max || "",
        location: pref.location || "",
        religion: pref.religion || "",
        gender: pref.gender || "",
      };

      setFilters(updatedFilters);

      // ✅ FETCH USING PREFERENCES
      fetchProfiles(updatedFilters, valid);
    } catch (err) {
      console.log("User fetch error:", err);
    }
  };

  // =========================================
  // 🔍 FETCH FILTERED PROFILES
  // =========================================
  const fetchProfiles = async (
    currentFilters = filters,
    premiumStatus = isPremium,
  ) => {
    try {
      const res = await API.get("/match", {
        params: currentFilters,
      });

      const data = res.data.profiles || [];

      // ✅ DAILY RECOMMENDATIONS
      const dailyRecs = premiumStatus ? data.slice(0, 8) : data.slice(0, 4);

      setRecommendations(dailyRecs);

      // ✅ EXCLUDE RECOMMENDATIONS FROM SIMILAR PROFILES
      const recommendationIds = new Set(dailyRecs.map((p) => p._id));

      const remainingProfiles = data.filter(
        (p) => !recommendationIds.has(p._id),
      );

      // 🔥 FREE USER LIMIT
      const visibleProfiles = premiumStatus
        ? remainingProfiles
        : remainingProfiles.slice(0, 4);

      // ✅ SIMILAR PROFILES
      setProfiles(visibleProfiles);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  // =========================================
  // 📊 MATCH SCORE
  // =========================================
  const calculateMatch = (profile) => {
    let score = 50;

    if (
      filters.location &&
      profile.location?.toLowerCase() === filters.location?.toLowerCase()
    ) {
      score += 15;
    }

    if (
      filters.religion &&
      profile.religion?.toLowerCase() === filters.religion?.toLowerCase()
    ) {
      score += 15;
    }

    if (
      filters.gender &&
      profile.gender?.toLowerCase() === filters.gender?.toLowerCase()
    ) {
      score += 10;
    }

    if (
      filters.minAge &&
      filters.maxAge &&
      profile.age >= Number(filters.minAge) &&
      profile.age <= Number(filters.maxAge)
    ) {
      score += 10;
    }

    return Math.min(score, 98);
  };

  // =========================================
  // 🎨 FLOATING ICONS
  // =========================================
  const FloatingIcon = ({ Icon, size, color, top, left, duration }) => (
    <motion.div
      className="absolute pointer-events-none opacity-[0.07]"
      style={{ top, left }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Icon size={size} color={color} />
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon Icon={Heart} size={40} top="10%" left="5%" duration={4} />

        <FloatingIcon
          Icon={Flower2}
          size={30}
          top="25%"
          left="85%"
          duration={5}
        />

        <FloatingIcon
          Icon={Sparkles}
          size={25}
          top="60%"
          left="10%"
          duration={6}
        />

        <FloatingIcon
          Icon={Heart}
          size={50}
          top="80%"
          left="75%"
          duration={4.5}
        />

        <FloatingIcon
          Icon={Star}
          size={20}
          top="45%"
          left="92%"
          duration={3.5}
        />

        <FloatingIcon
          Icon={Flower2}
          size={45}
          top="15%"
          left="40%"
          duration={7}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 p-4 md:p-6 pb-20">
        {/* HEADER */}
        <div
          className={`p-6 rounded-xl text-white shadow-lg bg-gradient-to-r ${COLORS.primary}`}
        >
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            Discover Matches <Heart size={20} fill="white" />
          </h2>

          <p className="text-sm opacity-90 mt-1">
            Find people based on your preferences
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            placeholder="Min Age"
            className="input border p-2 rounded"
            value={filters.minAge}
            onChange={(e) =>
              setFilters({
                ...filters,
                minAge: e.target.value,
              })
            }
          />

          <input
            placeholder="Max Age"
            className="input border p-2 rounded"
            value={filters.maxAge}
            onChange={(e) =>
              setFilters({
                ...filters,
                maxAge: e.target.value,
              })
            }
          />

          <input
            placeholder="Location"
            className="input border p-2 rounded"
            value={filters.location}
            onChange={(e) =>
              setFilters({
                ...filters,
                location: e.target.value,
              })
            }
          />

          <select
            className="input border p-2 rounded bg-white"
            value={filters.religion}
            onChange={(e) =>
              setFilters({
                ...filters,
                religion: e.target.value,
              })
            }
          >
            <option value="">Religion</option>
            <option>Hindu</option>
            <option>Muslim</option>
            <option>Christian</option>
          </select>

          <select
            className="input border p-2 rounded bg-white"
            value={filters.gender}
            onChange={(e) =>
              setFilters({
                ...filters,
                gender: e.target.value,
              })
            }
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <button
            onClick={() => fetchProfiles()}
            className={`col-span-full py-2 text-white font-bold rounded shadow-md transition-transform active:scale-95 bg-gradient-to-r ${COLORS.primary}`}
          >
            Apply Filters
          </button>
        </div>

        {/* DAILY RECOMMENDATIONS */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl flex items-center gap-2">
                ✨ Daily Recommendations
              </h3>

              <p className="text-sm text-gray-500">
                Matches picked based on your preferences
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-gray-400">No recommendations available</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendations.map((p) => {
                const score = calculateMatch(p);

                return (
                  <div
                    key={p._id}
                    className="relative rounded-xl overflow-hidden"
                  >
                    {/* MATCH BADGE */}
                    <div className="absolute top-2 left-2 z-20 bg-pink-500 text-white text-xs px-2 py-1 rounded-full shadow">
                      {score}% Match
                    </div>

                    <MatchCard user={p} matchPercent={score} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIMILAR PROFILES */}
        <div className="mt-10">
          <h3 className="font-bold text-lg mb-3">Similar Profiles</h3>

          {profiles.length === 0 ? (
            <p className="text-gray-400 text-center mt-6">
              No profiles found 😢
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((p) => {
                return (
                  <div
                    key={p._id}
                    className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <MatchCard user={p} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PREMIUM CTA */}
        {!isPremium && (
          <div className="mt-10 bg-white rounded-2xl shadow p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Unlock Unlimited Matches 💎
            </h3>

            <p className="text-gray-500 mb-4">
              Upgrade to premium and access unlimited profiles, chats, and
              recommendations.
            </p>

            <button
              onClick={() => navigate("/plans")}
              className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${COLORS.primary}`}
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <footer className="bg-white border-t mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            {/* COMPANY */}
            <div>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r ${COLORS.primary} bg-clip-text text-transparent`}
              >
                Skiez Digital
              </h2>

              <p className="text-gray-600 mt-3 text-sm leading-6">
                India: No: 81/5, 6th street, Shanthi Nagar, Chengalpattu
                District, Tamilnadu 603 003.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>

              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-pink-500 transition">
                    Home
                  </a>
                </li>

                <li>
                  <a href="/matches" className="hover:text-pink-500 transition">
                    Matches
                  </a>
                </li>

                <li>
                  <a href="/plans" className="hover:text-pink-500 transition">
                    Plans
                  </a>
                </li>

                <li>
                  <a href="/profile" className="hover:text-pink-500 transition">
                    Profile
                  </a>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Support</h3>

              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="/email-support"
                    className="hover:text-pink-500 transition"
                  >
                    Email Support
                  </a>
                </li>

                <li>
                  <a
                    href="/help-center"
                    className="hover:text-pink-500 transition"
                  >
                    Help Center
                  </a>
                </li>

                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-pink-500 transition"
                  >
                    Privacy Policy
                  </a>
                </li>

                <li>
                  <a
                    href="/terms-conditions"
                    className="hover:text-pink-500 transition"
                  >
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Contact</h3>

              <ul className="space-y-2 text-sm text-gray-600">
                <li>Phone: +91 8220043041</li>
                <li>Email: info@skiezdigital.com</li>
                <li>Working Hours: 9 AM - 6 PM</li>
              </ul>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="border-t mt-8 pt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Skiez Digital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
