import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PaymobIframe from "./PaymobIframe";

const PaymobPayment = ({ amount, orderId, customerData, items, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentKey, setPaymentKey] = useState("");
  const [iframeId, setIframeId] = useState("");
const successCalled = useRef(false); // 🔥 هنا

 const [started, setStarted] = useState(false);

const hasRun = useRef(false);

useEffect(() => {
  if (!orderId) return;

  initiatePayment();
}, [orderId]);

  const initiatePayment = async () => {
    console.log("🔄 initiatePayment called");
    setLoading(true);

    try {
    const res = await axios.post("http://localhost:5000/api/paymob/create-payment", {
  amount: Math.round(amount * 100),
  orderId,
  customerData,
  items, // 🔥 مهم جدًا
});


      console.log("✅ Paymob SUCCESS:", res.data);
      setPaymentKey(res.data.paymentKey);
      setIframeId(res.data.iframeId);
    } catch (error) {
      console.error("❌ Paymob ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("Render - loading:", loading, "paymentKey:", !!paymentKey);

  if (loading) return <div>جارٍ تحضير الدفع...</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      {paymentKey && iframeId ? (
        <PaymobIframe
  paymentKey={paymentKey}
  iframeId={iframeId}
  onSuccess={() => {
  if (successCalled.current) return;

  successCalled.current = true;

  console.log("🎉 SUCCESS ONCE ONLY");
  onSuccess?.();
}}
  amount={amount}
/>

      ) : (
        <div>خطأ في الدفع - حاول مرة أخرى</div>
      )}
    </div>
  );
};

export default PaymobPayment;