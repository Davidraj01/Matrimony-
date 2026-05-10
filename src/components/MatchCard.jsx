import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendInterest } from "../services/interestApi";
import API from "../services/axios";
import toast from "react-hot-toast";

export default function MatchCard({ user, matchPercent = 75 }) {
  const navigate = useNavigate();

  const [sent, setSent] = useState(user?.isInterestSent || false);
  const [loading, setLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [userPlan] = useState(localStorage.getItem("plan") || "free");

  useEffect(() => {
    checkShortlist();
  }, []);

  const checkShortlist = async () => {
    try {
      const res = await API.get("/shortlist");

      const id = user?.userId?._id || user?._id;

      const exists = res.data.some((u) => u._id === id);

      setShortlisted(exists);
    } catch (err) {
      console.log("Shortlist fetch error", err);
    }
  };

  // SHORTLIST TOGGLE
  const handleShortlist = async () => {
    try {
      const id = user?.userId?._id || user?._id;

      const res = await API.post("/shortlist/toggle", {
        targetUserId: id,
      });

      const isAdded = res.data.message === "Shortlist added";
      setShortlisted(isAdded);

      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to update shortlist");
    }
  };

  // VIEW PROFILE
  const handleView = async () => {
    const id = user.userId?._id || user._id;

    try {
      const planRes = await API.get("/plan/me");
      const plan = planRes.data.subscription;

      if (plan !== "premium") {
        toast.error("Upgrade to premium to view profiles 💎");
        navigate("/plans");
        return;
      }

      const res = await API.post("/profile/view", {
        userId: id,
      });

      toast.success(`${res.data.viewsLeft} profiles left`);
      navigate(`/user/${id}`);
    } catch (err) {
      console.log("VIEW ERROR:", err.response?.data || err.message);

      if (err.response?.data?.message === "No views left") {
        toast.error("No profile views left. Upgrade to premium 💎");
        navigate("/plans");
        return;
      }

      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // SEND INTEREST
  const handleInterest = async () => {
    if (sent) return;

    try {
      setLoading(true);

      const receiverId = user?.userId?._id || user?._id;

      const res = await sendInterest(receiverId);

      if (res?.alreadySent) {
        setSent(true);
        return;
      }

      toast.success("Interest sent ❤️");
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };
  // CHAT
  const handleChat = async () => {
    const id = user?.userId?._id;

    try {
      if (userPlan !== "premium") {
        toast.error("Upgrade to premium to chat 💎");
        navigate("/plans");
        return;
      }

      navigate(`/chat/${id}`, {
        state: { name: user.userId?.name || "User" },
      });
    } catch {
      toast.error("Something went wrong");
    }
  };
  const getImageUrl = (img) => {
    if (!img) return "/profile_avatar.png";

    return `https://matrimony-server-ungl.onrender.com/uploads/${img
      .replace("/uploads/", "")
      .replace("uploads/", "")}`;
  };
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      {/* IMAGE + SHORTLIST */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {/* ⭐ SHORTLIST */}
        <button
          onClick={handleShortlist}
          className={`absolute top-2 right-2 text-xl z-10 px-2 py-1 rounded-full shadow transition
            ${
              shortlisted
                ? "bg-yellow-400 text-white"
                : "bg-white/80 backdrop-blur"
            }`}
        >
          {shortlisted ? "⭐" : "☆"}
        </button>

        <img
          src={getImageUrl(user?.profilePic || user?.photos?.[0])}
          alt="profile"
          onError={(e) => {
            e.target.src = "/profile_avatar.png";
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* INFO */}
      <div className="p-3">
        <h3 className="font-semibold truncate">
          {user?.userId?.name || "User"}, {user?.age || "--"}
        </h3>

        <p className="text-sm text-gray-500 truncate">
          {user?.job || "No job"}
        </p>

        <p className="text-xs text-gray-400 mt-1 truncate">
          {user?.location || "No location"}
        </p>

        {/* MATCH */}
        <p className="text-pink-500 text-xs mt-2 font-semibold">
          {" "}
          {matchPercent}% Match
        </p>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-3">
          {/* ❤️ INTEREST */}
          <button
            onClick={handleInterest}
            disabled={sent || loading}
            className={`flex-1 rounded p-2 border transition ${
              sent
                ? "bg-pink-100 text-pink-400 cursor-not-allowed"
                : "text-pink-500 hover:bg-pink-50"
            }`}
          >
            {loading ? "..." : sent ? "Sent ✔" : "❤️"}
          </button>

          {/* 💬 CHAT */}
          <button
            onClick={handleChat}
            className="flex-1 border rounded p-2 hover:bg-gray-50"
          >
            💬
          </button>

          {/* 👁 VIEW */}
          <button
            onClick={handleView}
            className="flex-1 border rounded p-2 hover:bg-gray-50"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
