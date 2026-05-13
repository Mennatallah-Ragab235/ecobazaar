import React, { useState, useRef } from "react";
import axios from "axios";
import PaymobIframe from "./PaymobIframe";

const PaymobPayment = ({ amount, orderId, customerData, items, onSuccess }) => {
  const [loading, setLoading]       = useState(false);
  const [paymentKey, setPaymentKey] = useState("");
  const [iframeId, setIframeId]     = useState("");
  const [started, setStarted]       = useState(false);
  const successCalled               = useRef(false);

  const initiatePayment = async () => {
    if (started || loading) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/paymob/create-payment", {
        amount: Math.round(amount * 100),
        orderId,
        customerData,
        items,
      });
      setPaymentKey(res.data.paymentKey);
      setIframeId(res.data.iframeId);
      setStarted(true);
    } catch (error) {
      console.error("❌ Paymob ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="paymob-wrapper">
        <div className="paymob-amount">
          المبلغ المطلوب: <b>{amount?.toLocaleString("ar-EG")} جنيه</b>
        </div>
        <button
          className="paymob-start-btn"
          onClick={initiatePayment}
          disabled={loading}
        >
          {loading ? "⏳ جارٍ تحضير الدفع..." : "💳 المتابعة للدفع"}
        </button>
      </div>
    );
  }

  return (
    <div className="paymob-wrapper">
      {paymentKey && iframeId ? (
        <PaymobIframe
          paymentKey={paymentKey}
          iframeId={iframeId}
          onSuccess={() => {
            if (successCalled.current) return;
            successCalled.current = true;
            onSuccess?.();
          }}
          amount={amount}
        />
      ) : (
        <div className="paymob-error">خطأ في الدفع — حاول مرة أخرى</div>
      )}
    </div>
  );
};

export default PaymobPayment;