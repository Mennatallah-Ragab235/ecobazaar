import React, { useState } from 'react';
import axios from 'axios';
import PaymobIframe from './PaymobIframe';

const PaymobPayment = ({ amount, orderId, customerData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentKey, setPaymentKey] = useState('');
  const [iframeId, setIframeId] = useState('');  // ← جديد

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/paymob/create-payment', {
        amount,
        orderId,
        customerData
      });

      setPaymentKey(res.data.paymentKey);
      setIframeId(res.data.iframeId);  // ← جديد

    } catch (error) {
      console.error(error);
      alert("❌ فشل الدفع");
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={initiatePayment} disabled={loading || paymentKey}>
        {loading ? "جارٍ التحضير..." : `💳 ادفع ${amount} جنيه`}
      </button>

      {paymentKey && iframeId && (
        <PaymobIframe
          paymentKey={paymentKey}
          iframeId={iframeId}  // ← جاي من backend مش من process.env
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};

export default PaymobPayment;