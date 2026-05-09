import React, { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadPhotos,
  deletePhoto,
  setProfilePic,
} from "../services/profileApi";
import toast from "react-hot-toast";

const TABS = [
  "About",
  "Details",
  "Family",
  "Preferences",
  "Photos",
  "Interests",
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("About");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    fetchProfile();
  }, []);
  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const data = await getMyPlan();
      setPlan(data.subscription || "free");
    } catch {
      console.log("Plan fetch error");
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = await updateMyProfile(profile);
      setProfile(data);
      setEditMode(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...(prev.preferences || {}),
        [field]:
          field === "ageRange"
            ? { ...(prev.preferences?.ageRange || {}), ...value }
            : value,
      },
    }));
  };

  const handleUpload = async (e) => {
    const formData = new FormData();
    Array.from(e.target.files).forEach((f) => formData.append("photos", f));
    try {
      const data = await uploadPhotos(formData);
      setProfile(data);
      toast.success("Photos uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDeletePhoto = async (url) => {
    try {
      const data = await deletePhoto(url);
      setProfile(data);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSetProfilePic = async (url) => {
    try {
      const data = await setProfilePic(url);
      setProfile(data);
    } catch {
      toast.error("Failed to set DP");
    }
  };

  const profileStrength = () => {
    const fields = [
      profile?.age,
      profile?.location,
      profile?.education,
      profile?.job,
      profile?.income,
      profile?.bio,
      profile?.diet,
      profile?.father,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading)
    return <div className="p-6 flex justify-center mt-10">Loading...</div>;
  if (!profile) return null;
  console.log(profile?.userId.userUniqueId);
  return (
    <div className="w-full p-3 md:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white p-4 md:p-6 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center overflow-hidden">
        <div className="flex flex-row gap-4 items-center w-full sm:w-auto min-w-0">
          <img
            src={
              profile.profilePic
                ? `${import.meta.env.VITE_API_URL}${profile.profilePic}`
                : ""
            }
            alt="Profile"
            className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white/30 object-cover bg-gray-200 shadow-lg shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs opacity-80 mt-1">
              ID:{" "}
              <span className="font-semibold tracking-wide">
                {profile?.userId?.userUniqueId
                  ? profile.userId.userUniqueId
                  : "NO ID"}
              </span>
            </p>
            <h2 className="text-xl md:text-2xl font-bold truncate">
              {profile?.userId?.name || profile?.name || "User"}
            </h2>

            <p className="text-sm opacity-90 truncate">
              {profile.age || "--"} yrs •{" "}
              {profile.location || "Location not set"}
            </p>

            <div className="flex flex-wrap gap-2 mt-2 text-[10px] md:text-xs">
              <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                {profile.job || "Add job"}
              </span>
              <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-md">
                {profile.education || "Add education"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-4 sm:gap-1 border-t sm:border-none border-white/20 pt-4 sm:pt-0">
          <div className="text-left sm:text-center">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">
              Strength
            </p>
            <p className="text-xl font-black">{profileStrength()}%</p>
          </div>
          {/* ✅ PLAN */}
          <div className="text-left sm:text-center">
            <p className="text-[10px] opacity-80 uppercase tracking-wider">
              Plan
            </p>

            <p
              className={`text-lg font-bold ${
                plan === "premium" ? "text-green-300" : "text-gray-200"
              }`}
            >
              {plan === "premium" ? "Premium 💎" : "Free"}
            </p>
          </div>

          <button
            onClick={editMode ? handleSave : () => setEditMode(true)}
            className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition-colors text-sm whitespace-nowrap shrink-0 w-auto"
          >
            {editMode ? "Save" : "Edit"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="w-full overflow-x-auto mt-6 border-b border-gray-200 sticky top-0 bg-gray-50 z-10 no-scrollbar">
        <div className="flex gap-2 pb-3 px-1 w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
                ${
                  activeTab === tab
                    ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                    : "bg-white text-gray-500 hover:bg-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6 max-w-5xl mx-auto w-full overflow-hidden">
        {/* ABOUT */}
        {activeTab === "About" && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">About Me</h3>

            {editMode ? (
              <textarea
                rows="4"
                value={profile.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-line">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>
        )}
        {/* DETAILS / FAMILY / PREF */}
        {(activeTab === "Details" ||
          activeTab === "Family" ||
          activeTab === "Preferences") && (
          <>
            {/* ⭐ ADD THIS BLOCK HERE (ONLY FOR PREFERENCES) */}
            {activeTab === "Preferences" && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Min Age</p>

                  {editMode ? (
                    <input
                      type="number"
                      value={profile.preferences?.ageRange?.min || ""}
                      onChange={(e) =>
                        handlePrefChange("ageRange", {
                          min: e.target.value,
                        })
                      }
                      className="border-b w-full outline-none"
                    />
                  ) : (
                    <p>{profile.preferences?.ageRange?.min || "--"}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Max Age</p>

                  {editMode ? (
                    <input
                      type="number"
                      value={profile.preferences?.ageRange?.max || ""}
                      onChange={(e) =>
                        handlePrefChange("ageRange", {
                          max: e.target.value,
                        })
                      }
                      className="border-b w-full outline-none"
                    />
                  ) : (
                    <p>{profile.preferences?.ageRange?.max || "--"}</p>
                  )}
                </div>
              </div>
            )}

            {/* 🔥 YOUR EXISTING GRID (UPDATED FIELDS ONLY) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {(activeTab === "Details"
                ? [
                    "name",
                    "age",
                    "gender",
                    "height",
                    "religion",
                    "caste",
                    "job",
                    "education",
                    "phone",
                    "location",
                    "income",
                    "diet",
                    "maritalStatus",
                    "motherTongue",
                  ]
                : activeTab === "Family"
                  ? [
                      "father",
                      "mother",
                      "siblings",
                      "familyType",
                      "familyStatus",
                    ]
                  : [
                      "location",
                      "religion",
                      "education",
                      "job",
                      "income",
                      "maritalStatus",
                      "motherTongue",
                      "diet",
                      "smoke",
                      "drink",
                      "familyStatus",
                      "familyType",
                      "willingToRelocate",
                      "profileWithPhoto",
                    ]
              ).map((field) => (
                <div
                  key={field}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-0"
                >
                  <p className="text-gray-400 text-xs mb-1">{field}</p>

                  {editMode ? (
                    <input
                      value={
                        activeTab === "Preferences"
                          ? profile.preferences?.[field] || ""
                          : profile[field] || ""
                      }
                      onChange={(e) =>
                        activeTab === "Preferences"
                          ? handlePrefChange(field, e.target.value)
                          : handleChange(field, e.target.value)
                      }
                      className="border-b w-full outline-none"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium truncate">
                      {activeTab === "Preferences"
                        ? profile.preferences?.[field] || "--"
                        : profile[field] || "--"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {/* PHOTOS */}
        {activeTab === "Photos" && (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="file:bg-green-500 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:cursor-pointer file:mr-4 text-sm text-gray-600"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {profile.photos?.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${img}`}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex justify-center items-center gap-2">
                    <button
                      className="text-yellow-400 text-2xl"
                      onClick={() => handleSetProfilePic(img)}
                    >
                      Set DP
                    </button>
                    <button
                      className="text-red-600 text-xl"
                      onClick={() => handleDeletePhoto(img)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* INTERESTS */}
        {activeTab === "Interests" && (
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="border p-2 w-full"
              />

              <button
                onClick={() => {
                  if (!newInterest) return;
                  setProfile({
                    ...profile,
                    interests: [...(profile.interests || []), newInterest],
                  });
                  setNewInterest("");
                }}
                className="bg-pink-600 text-white px-4"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((item, i) => (
                <span
                  key={i}
                  className="bg-pink-100 px-3 py-1 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
