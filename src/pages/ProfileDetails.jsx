import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/axios";
import { calculateMatch } from "../../utils/calculateMatch";

export default function ProfileDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [matchPercent, setMatchPercent] = useState(50);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/profile/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.log("Error fetching profile", err);
    }
  };
  useEffect(() => {
    if (profile) {
      fetchPlan();
    }
  }, [profile]);

  const fetchPlan = async () => {
    try {
      const res = await API.get("/profile/me");

      const user = res.data.userId;
      const myPreferences = res.data.preferences || {};

      const valid =
        user?.subscription === "premium" &&
        user?.premiumExpires &&
        new Date(user.premiumExpires) > new Date();

      setUserPlan(valid ? "premium" : "free");
      if (profile) {
        setMatchPercent(calculateMatch(myPreferences, profile));
      }
    } catch {
      console.log("Plan fetch error");
    }
  };

  if (!profile) return <p className="p-4">Loading...</p>;
  const imageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300";

    const cleanPath = path.replace(/^\/+/, "");

    return `https://matrimony-server-ungl.onrender.com/${cleanPath}`;
  };
  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow p-4">
        {/* IMAGE + BASIC */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* IMAGE */}
          <img
            src={imageUrl(profile?.profilePic || profile?.photos?.[0])}
            alt="profile"
            className="w-full md:w-64 h-72 object-cover rounded-lg"
          />

          {/* BASIC INFO */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {profile?.userId?.name}, {profile?.age}
            </h2>

            <p className="text-gray-600 mt-1">{profile?.job}</p>
            <p className="text-gray-500">{profile?.location}</p>

            {/* MATCH */}

            <p className="text-pink-500 font-semibold mt-2">
              {matchPercent}% Match 💖
            </p>
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-1">About</h3>
          <p className="text-gray-600 text-sm">
            {profile?.bio || "No bio available"}
          </p>
        </div>

        {/* GRID SECTIONS */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* PERSONAL */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Personal Details</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Gender:</span>{" "}
                {profile?.gender || "-"}
              </p>
              <p>
                <span className="text-gray-500">Height:</span>{" "}
                {profile?.height || "-"}
              </p>
              <p>
                <span className="text-gray-500">Religion:</span>{" "}
                {profile?.religion || "-"}
              </p>
              <p>
                <span className="text-gray-500">Caste:</span>{" "}
                {profile?.caste || "-"}
              </p>
              <p>
                <span className="text-gray-500">Marital:</span>{" "}
                {profile?.maritalStatus || "-"}
              </p>
              <p>
                <span className="text-gray-500">Language:</span>{" "}
                {profile?.motherTongue || "-"}
              </p>
            </div>
          </div>

          {/* CAREER */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Career</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Education:</span>{" "}
                {profile?.education || "-"}
              </p>
              <p>
                <span className="text-gray-500">Job:</span>{" "}
                {profile?.job || "-"}
              </p>
              <p>
                <span className="text-gray-500">Income:</span>{" "}
                {profile?.income || "-"}
              </p>
            </div>
          </div>

          {/* LIFESTYLE */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Lifestyle</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Diet:</span>{" "}
                {profile?.diet || "-"}
              </p>
              <p>
                <span className="text-gray-500">Smoke:</span>{" "}
                {profile?.smoke || "-"}
              </p>
              <p>
                <span className="text-gray-500">Drink:</span>{" "}
                {profile?.drink || "-"}
              </p>
            </div>
          </div>

          {/* FAMILY */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Family</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-500">Father:</span>{" "}
                {profile?.father || "-"}
              </p>
              <p>
                <span className="text-gray-500">Mother:</span>{" "}
                {profile?.mother || "-"}
              </p>
              <p>
                <span className="text-gray-500">Siblings:</span>{" "}
                {profile?.siblings || "-"}
              </p>
              <p>
                <span className="text-gray-500">Type:</span>{" "}
                {profile?.familyType || "-"}
              </p>
              <p>
                <span className="text-gray-500">Status:</span>{" "}
                {profile?.familyStatus || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="mt-6 bg-pink-50 p-4 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Contact</h3>
            <p className="text-sm">
              {userPlan === "premium"
                ? profile?.phone || "No phone available"
                : "🔒 Hidden for free users"}
            </p>
            {userPlan !== "premium" && (
              <button
                onClick={() => navigate("/plans")}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg"
              >
                Upgrade 💎
              </button>
            )}
          </div>

          {!profile?.phone && userPlan !== "premium" && (
            <button onClick={() => navigate("/plans")}>Upgrade 💎</button>
          )}
        </div>

        {/* PHOTOS */}
        {profile?.photos?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {profile.photos.map((p, i) => (
                <img
                  key={i}
                  src={imageUrl(p)}
                  alt="photo"
                  className="w-full aspect-square object-cover rounded-lg hover:scale-105 transition duration-300"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
