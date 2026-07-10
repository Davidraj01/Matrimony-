import React, { useEffect, useState } from "react";
import { getPlans, getMyPlan } from "../services/planApi";
import API from "../services/axios";
import toast from "react-hot-toast";
import { COLORS } from "../../utils/colors.js";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchMyPlan();
  }, []);

  // =========================
  // FETCH PLANS
  // =========================
  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      toast.error("Failed to load plans");
    }
  };

  // =========================
  // FETCH CURRENT PLAN
  // =========================
  const fetchMyPlan = async () => {
    try {
      const data = await getMyPlan();

      setCurrentPlan(data.subscription);

      // ✅ SAVE LOCALLY
      localStorage.setItem("plan", data.subscription);

      // ✅ UPDATE USER OBJECT
      const existingUser = JSON.parse(localStorage.getItem("user"));

      if (existingUser) {
        existingUser.subscription = data.subscription;
        existingUser.isPremium = data.subscription === "premium";

        localStorage.setItem("user", JSON.stringify(existingUser));
      }
    } catch {
      toast.error("Failed to load current plan");
    }
  };

  
  // =========================
  // PAYMENT HANDLER
  // =========================
  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!window.Razorpay) {
        toast.error("Razorpay unavailable");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user")) || {};

      // =========================
      // CREATE ORDER
      // =========================
      // const { data } = await API.post("/payment/create-order");
      const token = localStorage.getItem("token");

const orderRes = await fetch(
  "https://mony.bazhilgroups.in/api/payment/create-order",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  }
);

const data = await orderRes.json();

      console.log("ORDER:", data);

      // =========================
      // OPTIONS
      // =========================
      const options = {
        key: "rzp_live_T4ZJrIbGj17pJK",

        amount: data.amount,

        currency: "INR",

        order_id: data.id,

        name: "Royal Matrimony",

        description: "Premium Plan",

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },

        theme: {
          color: "#ec4899",
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },

        // =========================
        // SUCCESS HANDLER
        // =========================
        handler: async function (response) {
          try {
            console.log("PAYMENT RESPONSE:", response);

            await fetch(
  "https://mony.bazhilgroups.in/api/payment/verify",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  }
);

            console.log("VERIFY RESPONSE:", verifyRes.data);

            // ✅ UPDATE LOCAL STATE
            setCurrentPlan("premium");

            // ✅ SAVE LOCALLY
            localStorage.setItem("plan", "premium");

            // ✅ UPDATE USER OBJECT
            const existingUser = JSON.parse(localStorage.getItem("user"));

            if (existingUser) {
              existingUser.subscription = "premium";
              existingUser.isPremium = true;

              localStorage.setItem("user", JSON.stringify(existingUser));
            }

            toast.success("Payment successful 🎉");

            // ✅ REFRESH PLAN FROM SERVER
            await fetchMyPlan();
          } catch (err) {
            console.log("VERIFY ERROR:", err.response?.data || err);

            toast.error(err.response?.data?.message || "Verification failed");
          }
        },
      };

      console.log("User Agent:", navigator.userAgent);

      // ✅ REMOVE OLD POPUPS
      document
        .querySelectorAll(".razorpay-container")
        .forEach((e) => e.remove());

      // =========================
      // OPEN PAYMENT
      // =========================
      const rzp = new window.Razorpay(options);
      console.log("Razorpay instance created");

      // =========================
      // PAYMENT FAILED
      // =========================
      rzp.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED:", response.error);

        toast.error(response.error.description || "Payment failed");
      });
      console.log("opening Razorpay...");
      rzp.open();
      console.log("Razorpay open called");
    } catch (err) {
      console.log("PAYMENT ERROR:", err);

      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
      {/* HEADER */}
      <div
        className={`p-6 rounded-xl text-white bg-gradient-to-r ${COLORS.primary}`}
      >
        <h2 className="text-xl md:text-2xl font-bold">Choose Your Plan</h2>

        <p className="text-sm opacity-90 mt-1">
          Upgrade to unlock premium features
        </p>
      </div>

      {/* PLANS */}
      <div className="grid sm:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isPremium = plan.name === "premium";

          const isCurrent = currentPlan === plan.name;

          const isPremiumUser = currentPlan === "premium";

          return (
            <div
              key={plan.name}
              className={`rounded-xl p-6 shadow transition relative ${
                isPremium
                  ? "border-2 border-pink-500 scale-105 bg-white"
                  : "bg-white"
              }`}
            >
              {/* TAG */}
              {isPremium && (
                <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                  Popular
                </span>
              )}

              {/* TITLE */}
              <h3 className="text-lg font-bold capitalize">{plan.name}</h3>

              {/* PRICE */}
              <p className="text-2xl font-bold mt-2">
                ₹{plan.price}
                <span className="text-sm text-gray-500"> / month</span>
              </p>

              {/* FEATURES */}
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plan.features.map((f, i) => (
                  <li key={i}>✔ {f}</li>
                ))}
              </ul>

              {/* BUTTON */}
              {isCurrent ? (
                <button className="bg-gray-300 w-full py-2 rounded mt-6">
                  Active Plan ✅
                </button>
              ) : isPremiumUser && plan.name === "free" ? (
                <button className="bg-gray-200 w-full py-2 rounded mt-6 cursor-not-allowed">
                  Not Available
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={handlePayment}
                  className={`mt-6 w-full py-2 rounded text-white bg-gradient-to-r ${COLORS.primary}`}
                >
                  {loading ? "Processing..." : "Upgrade Now"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
