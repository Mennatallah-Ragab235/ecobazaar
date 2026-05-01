import React, { useEffect, useState } from "react";

const PaymobIframe = ({ paymentKey, iframeId, onSuccess, amount }) => {
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const handleMessage = (event) => {
    if (!event.origin.includes("paymob")) return;

    const data = event.data;

    console.log("🔥 Paymob Event:", data);

    const success =
      data?.success === true ||
      data?.obj?.success === true ||
      data?.type === "TRANSACTION_SUCCESS" ||
      data?.obj?.txn_response_code === "APPROVED" ||
      data?.txn_response_code === "APPROVED";

    if (success) {
      console.log("✅ SUCCESS DETECTED");
      onSuccess?.();
    }
  };

  // ✅ لازم تضيفي event listener
  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}, [onSuccess]);
  return (
    <div className="paymob-wrapper">
      <div className="paymob-header">
        <span>دفع آمن عبر Paymob</span>
      </div>

      {amount && (
        <div className="paymob-amount">
          المبلغ المطلوب: <b>{amount.toLocaleString("ar-EG")} جنيه</b>
        </div>
      )}

      <div className="paymob-iframe-wrap">
        {loading && <p>جارٍ تحميل صفحة الدفع...</p>}

        <iframe
          src={`https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`}
          width="100%"
          height="520"
          frameBorder="0"
          title="Paymob Payment"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default PaymobIframe;
