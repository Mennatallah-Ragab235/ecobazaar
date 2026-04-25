import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/CartPage.css";

export default function CartPage({ refreshCart }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("فشل تحميل السلة");

      const data = await res.json();
      setCart(data || { items: [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId, quantity) {
    if (quantity < 1) return;

    try {
      const res = await fetch("/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      setCart(data);

      refreshCart?.(); // 🔥 مهم جدًا
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeItem(productId) {
    try {
      const res = await fetch(`/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("فشل حذف المنتج");

      const data = await res.json();
      setCart(data);

      // 🔥 أهم سطر: تحديث Navbar فورًا
      refreshCart?.();

    } catch (e) {
      setError(e.message);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + Number(item.product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 30;
  const total = subtotal + shipping;

  if (loading) return <div className="cart-loading">جارٍ التحميل...</div>;

  return (
    <div className="cart-page" dir="ltr">
      <div className="cart-wrapper">
        <h1 className="cart-title">سلة التسوق</h1>

        {error && <div className="cart-error">⚠️ {error}</div>}

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>سلتك فارغة</p>
            <button
              onClick={() => navigate("/products")}
              className="cart-shop-btn"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ITEMS */}
            <div className="cart-items">
              {cart.items.map((item) => {
                const product = item.product;
                const img = product?.image || product?.images?.[0];
                const price = Number(product?.price || 0);

                return (
                  <div key={product?._id} className="cart-item">

                    <div className="cart-item-img">
                      {img ? (
                        <img src={img} alt={product?.name} />
                      ) : (
                        <div className="cart-item-img-placeholder">🌿</div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h3>{product?.name}</h3>
                    </div>

                    <div className="cart-item-qty">
                      <button
                        onClick={() =>
                          updateQuantity(product._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(product._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      {(price * item.quantity).toLocaleString("ar-EG")} جنيه
                    </div>

                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(product._id)}
                    >
                      🗑️
                    </button>

                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="cart-summary">
              <h2>ملخص الطلب</h2>

              <div className="summary-rows">
                {cart.items.map((item) => (
                  <div key={item.product?._id} className="summary-row">
                    <span>
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span>
                      {(Number(item.product?.price || 0) * item.quantity).toLocaleString("ar-EG")} جنيه
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toLocaleString("ar-EG")} جنيه</span>
              </div>

              <div className="summary-row">
                <span>الشحن</span>
                <span>{shipping === 0 ? "مجاني" : shipping + " جنيه"}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span>الإجمالي</span>
                <span className="total-amount">
                  {total.toLocaleString("ar-EG")} جنيه
                </span>
              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                إتمام الطلب
              </button>

              <button
                className="continue-btn"
                onClick={() => navigate("/products")}
              >
                متابعة التسوق
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
