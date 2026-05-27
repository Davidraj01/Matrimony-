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

  const fetchPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      toast.error("Failed to load plans");
    }
  };

  const fetchMyPlan = async () => {
    try {
      const data = await getMyPlan();
      setCurrentPlan(data.subscription);
    } catch {
      toast.error("Failed to load current plan");
    }
  };

  //  PAYMENT HANDLER
  const handlePayment = async () => {
    try {
      // ✅ LOAD RAZORPAY SDK DYNAMICALLY
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");

          script.src = "https://checkout.razorpay.com/v1/checkout.js";

          script.onload = () => {
            resolve(true);
          };

          script.onerror = () => {
            resolve(false);
          };

          document.body.appendChild(script);
        });
      };

      const sdkLoaded = await loadRazorpay();

      // ✅ SDK FAILED
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // ✅ CHECK WINDOW RAZORPAY
      if (!window.Razorpay) {
        toast.error("Razorpay not available");
        return;
      }
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);

      // 1️ Create order
      const { data } = await API.post("/payment/create-order");
      console.log("ORDER:", data);
      // 2️ Razorpay config
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        order_id: data.id,

        name: "Matrimony App",
        description: "Premium Plan",

        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },

        handler: async function (response) {
          try {
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: "premium",
            });
            localStorage.setItem("plan", "premium");
            toast.success("Payment successful 🎉");
            window.location.reload();
            fetchMyPlan();
          } catch (err) {
            console.log(err.response?.data);
            toast.error("Verification failed");
          }
        },

        theme: {
          color: "#ec4899",
        },
      };
      console.log("RAZORPAY OPTIONS:", options);
      //  remove old cached popup
      document
        .querySelectorAll(".razorpay-container")
        .forEach((e) => e.remove());
      console.log(window.navigator.userAgent);

      const rzp = new window.Razorpay({
        ...options,
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },
      });

      rzp.open();
    } catch (err) {
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
                <button className="bg-gray-300 w-full py-2 rounded">
                  Active Plan ✅
                </button>
              ) : isPremiumUser && plan.name === "free" ? (
                <button className="bg-gray-200 w-full py-2 rounded cursor-not-allowed">
                  Not Available
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  className={`mt-6 w-full py-2 rounded text-white bg-gradient-to-r ${COLORS.primary}`}
                >
                  Upgrade Now
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
