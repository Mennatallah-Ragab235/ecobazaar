import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Checkout.css";
import PaymobPayment from '../components/Payment/PaymobPayment';

function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [cart, setCart] = useState({ items: [] });
  const [loadingCart, setLoadingCart] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPaymob, setShowPaymob] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFirstName(data.fullName?.split(" ")[0] || "");
        setLastName(data.fullName?.split(" ")[1] || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setZip(data.zip || "");
        setUserEmail(data.email || "");
      });
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => setCart(data))
      .catch(() => {})
      .finally(() => setLoadingCart(false));
  }, [token, navigate]);

  const shippingPrice = shipping === "standard" ? 30 : 60;
  const subtotal = cart.items.reduce((acc, item) => {
    return acc + parseFloat(item.product?.price || 0) * item.quantity;
  }, 0);
  const total = subtotal + shippingPrice;

  // ✅ validate الحقول المطلوبة
  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("من فضلك أدخل اسمك الأول والأخير");
      return false;
    }
    if (!phone.trim()) {
      setError("من فضلك أدخل رقم هاتفك");
      return false;
    }
    if (!address.trim() || !city.trim()) {
      setError("من فضلك أدخل عنوانك بالكامل");
      return false;
    }
    if (cart.items.length === 0) {
      setError("سلتك فارغة!");
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          fullName: `${firstName} ${lastName}`,
          phone,
          address,
          city,
          zip,
        },
        shippingMethod: shipping,
        shippingPrice,
        paymentMethod: payment,
        subtotal,
        total,
        status: payment === "card" ? "pending" : "confirmed",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      return res.ok ? data._id : null;
    } catch (err) {
      console.error("خطأ في إنشاء الطلب:", err);
      return null;
    }
  };

 const handlePaymentSuccess = async () => {
  try {
    await fetch(`/api/orders/${orderId}/pay`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "paid" }),
    });

    await fetch("/api/cart/clear", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setShowPaymob(false);

    navigate("/order-success", {
      state: { orderId },
    });

  } catch (err) {
    setError("❌ خطأ في تأكيد الدفع");
  }
};




  
const handleConfirm = async () => {
  setError("");

  if (submitting) return;
  if (!validateForm()) return;

  setSubmitting(true);

  try {
    const newOrderId = await createOrder();

    if (!newOrderId) {
      setError("فشل إنشاء الطلب، حاول مرة أخرى");
      return;
    }

    if (payment === "card") {
      setOrderId(newOrderId);
      setShowPaymob(true); // مباشرة بدون timeout
    } else {
      await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/order-success", {
        state: { orderId: newOrderId },
      });
    }

  } catch (err) {
    console.error(err);
    setError("حدث خطأ غير متوقع");
  } finally {
    setSubmitting(false);
  }
};



  const customerData = {
    first_name: firstName,
    last_name: lastName,
    email: userEmail,
    phone_number: phone,
    street: address,
    city: city,
    country: "EG",
    postal_code: zip || "00000",
    building: "1",
    floor: "1",
    apartment: "1",
  };

  if (loadingCart) return <div className="checkout-loading">جارٍ التحميل...</div>;

  return (
    <div className="checkout-page" dir="rtl">
      <div className="cart-wrapper">
        <h2 className="checkout-title">إتمام الطلب</h2>
        {error && <div className="checkout-error">⚠️ {error}</div>}

        {/* ✅ form بدون onSubmit عشان نتحكم فيه يدوياً */}
        <div className="checkout-container">

          {/* LEFT */}
          <div className="checkout-left">

            {/* Address */}
            <div className="box">
              <h3 className="box-title">📍 عنوان التوصيل</h3>
              <div className="form-grid">
                <div className="full">
                  <label>الاسم الأول</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="سارة"
                    required
                  />
                </div>
                <div className="full">
                  <label>الاسم الأخير</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="أحمد"
                    required
                  />
                </div>
                <div className="full">
                  <label>رقم الهاتف</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    required
                  />
                </div>
                <div className="full">
                  <label>العنوان بالتفصيل</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="الشارع، رقم المبنى، الشقة..."
                    required
                  />
                </div>
                <div>
                  <label>المدينة</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="القاهرة، الإسكندرية..."
                    required
                  />
                </div>
                <div>
                  <label>الرمز البريدي</label>
                  <input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="box">
              <h3 className="box-title">🚚 طريقة الشحن</h3>
              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shipping === "standard"}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <div className="shipping-right">
                  <span>شحن قياسي &nbsp;3 - 5 أيام عمل</span>
                  <span className="price">30 جنيه</span>
                </div>
              </label>
              <label className="shipping-option">
                <input
                  type="radio"
                  name="shipping"
                  value="fast"
                  checked={shipping === "fast"}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <div className="shipping-right">
                  <span>شحن سريع &nbsp;1 - 2 يوم عمل</span>
                  <span className="price">60 جنيه</span>
                </div>
              </label>
            </div>

            {/* Payment */}
            <div className="box">
              <h3 className="box-title">💳 طريقة الدفع</h3>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={(e) => {
                    setPayment(e.target.value);
                    setShowPaymob(false);
                  }}
                />
                <span>الدفع نقداً عند الاستلام</span>
                <small className="payment-desc">ادفع نقدًا عند استلام طلبك</small>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={payment === "card"}
                  onChange={(e) => {
                    setPayment(e.target.value);
                    setShowPaymob(false);
                  }}
                />
                <span className="payment-title">بطاقة ائتمان / Paymob</span>
                <small className="payment-desc">
                  ادفع بأمان بـ Visa/Mastercard. محمي 100%
                </small>
              </label>
            </div>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="checkout-right">
            <div className="order-box">
              <h3>ملخص الطلب</h3>

              {loadingCart ? (
                <p style={{ color: "#aaa" }}>جارٍ التحميل...</p>
              ) : cart.items.length === 0 ? (
                <p style={{ color: "#aaa" }}>السلة فارغة</p>
              ) : (
                <>
                  {cart.items.map((item, i) => (
                    <div key={i} className="order-item">
                      <span>{item.quantity} × {item.product?.name}</span>
                      <span>
                        {(parseFloat(item.product?.price || 0) * item.quantity)
                          .toLocaleString("ar-EG")} جنيه
                      </span>
                    </div>
                  ))}
                  <hr />
                  <div className="order-item">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal.toLocaleString("ar-EG")} جنيه</span>
                  </div>
                  <div className="order-item">
                    <span>الشحن</span>
                    <span>{shippingPrice} جنيه</span>
                  </div>
                  <div className="order-total">
                    <span>المجموع الكلي</span>
                    <span>{total.toLocaleString("ar-EG")} جنيه</span>
                  </div>
                </>
              )}

              {/* ✅ زرار موحد أو Paymob widget */}
{showPaymob && orderId ? (
  <div className="paymob-section">
    <PaymobPayment
      amount={total}
      orderId={orderId}
      customerData={customerData}
      onSuccess={handlePaymentSuccess}
    />

    <button
      type="button"
      onClick={() => {
        setShowPaymob(false);
        setOrderId("");
      }}
      style={{ marginTop: "10px", background: "#eee", color: "#333" }}
    >
      ← رجوع
    </button>
  </div>
) : (
  <button
    type="button"
    disabled={submitting || cart.items.length === 0}
    onClick={handleConfirm}
  >
    {submitting
      ? "جارٍ التأكيد..."
      : payment === "card"
      ? "💳 ادفع بالبطاقة الآن"
      : "✅ تأكيد الطلب"}
  </button>
)}



              <p className="policy">
                بإتمام الطلب فإنك توافق على <a href="#">الشروط والأحكام</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;