import React from "react";

export default function PaymentTest() {
  const pay = async () => {
    try {
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

      const order = await orderRes.json();

      console.log("ORDER:", order);

      const options = {
        key: "rzp_live_T4ZJrIbGj17pJK",

        amount: order.amount,

        currency: order.currency,

        order_id: order.id,

        name: "Royal Matrimony",

        description: "Premium Plan",

        handler: async function (response) {
          console.log("PAYMENT SUCCESS:", response);

          const verify = await fetch(
            "https://mony.bazhilgroups.in/api/payment/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
              body: JSON.stringify(response),
            }
          );

          console.log("VERIFY:", await verify.json());

          alert("Payment Successful");
        },
      };

      console.log("OPTIONS:", options);

      const rzp = new Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED:", response.error);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <button
        onClick={pay}
        style={{
          background: "#ec4899",
          color: "#fff",
          border: "none",
          padding: "15px 30px",
          borderRadius: "10px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Pay ₹100
      </button>
    </div>
  );
}