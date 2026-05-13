import { useState, useEffect } from "react";
import SellerLayout from "../../components/Seller/SellerLayout";

export default function SellerRevenue() {
  const [wallet,  setWallet]  = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جيب الـ wallet
        const wRes = await fetch("/api/seller/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wData = await wRes.json();
        setWallet(wData);

        // جيب الطلبات عشان نحسب الإيرادات
        const oRes = await fetch("/api/seller/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const oData = await oRes.json();
setOrders(
  Array.isArray(oData)
    ? oData.map(o => ({
        ...o,
        subtotal: o.subtotal || 0,
        netAmount: o.netAmount ?? null,
      }))
    : []
);      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // حساب الإحصائيات من الطلبات
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const shippedOrders   = orders.filter(o => o.status === "shipped");
  const pendingOrders   = orders.filter(o => o.status === "pending");

const totalEarned =
  (wallet?.availableBalance || 0) +
  (wallet?.pendingBalance || 0);
  console.log(wallet);
const pendingEarnings = orders
  .filter(o => o.fundsReleased === false)
  .reduce((sum, o) => {
    const subtotal = o.subtotal || 0;
    const fee = subtotal * 0.10; // 10%
    return sum + (subtotal - fee);
  }, 0);

  if (loading) return (
    <SellerLayout>
      <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
        جاري التحميل...
      </div>
    </SellerLayout>
  );
  return (
      <div dir="rtl" style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a2e1f", margin: 0 }}>
            💰 الإيرادات والمحفظة
          </h1>
          <p style={{ color: "#888", fontSize: 14, margin: "4px 0 0" }}>
            متابعة أرباحك ورصيدك
          </p>
        </div>

        {/* Wallet Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Available */}
          <div style={{
            background: "#fff", borderRadius: 14, padding: "24px 28px",
            border: "1px solid #e0ebe4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              💵 الرصيد المتاح
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#2e7d32" }}>
              {(wallet?.availableBalance || 0).toLocaleString("ar-EG")}
              <span style={{ fontSize: 16, fontWeight: 400, marginRight: 6 }}>جنيه</span>
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
              الفلوس اللي اتحررت بعد تأكيد الاستلام
            </div>
          </div>

          {/* Pending */}
          <div style={{
            background: "#fff", borderRadius: 14, padding: "24px 28px",
            border: "1px solid #e0ebe4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
              ⏳ قيد التحرير
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#e67e22" }}>
              {pendingEarnings.toLocaleString("ar-EG")}
              <span style={{ fontSize: 16, fontWeight: 400, marginRight: 6 }}>جنيه</span>
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
              محجوزة لحد ما المشتري يأكد الاستلام
            </div>
          </div>

        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16, marginBottom: 24
        }}>
          {[
            { label: "إجمالي المكتسب",   value: `${totalEarned.toLocaleString("ar-EG")} جنيه`, color: "#2e7d32" },
            { label: "طلبات تم تسليمها", value: deliveredOrders.length, color: "#2e7d32" },
            { label: "طلبات في الطريق",  value: shippedOrders.length,   color: "#e67e22" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 12, padding: "18px 20px",
              border: "1px solid #e0ebe4", textAlign: "center"
            }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Escrow explanation */}
        <div style={{
          background: "#f0faf4", border: "1px solid #b8ddc8",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          fontSize: 13, color: "#2e7d32", lineHeight: 1.7
        }}>
          <strong>🔒 ازاي بيشتغل نظام الحماية (Escrow)؟</strong><br/>
          لما المشتري بيدفع، الفلوس بتتحجز في "قيد التحرير" — مش بتوصلك في الحال.
          لما المشتري يضغط "تأكيد الاستلام"، الفلوس بتتنقل تلقائياً للـ "الرصيد المتاح".
        </div>

        {/* Delivered orders table */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e0ebe4",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #f0f0f0",
            fontWeight: 700, fontSize: 15, color: "#1a2e1f"
          }}>
            📋 سجل الإيرادات — الطلبات المكتملة
          </div>

          {deliveredOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
              مفيش طلبات مكتملة لسه
            </div>
          ) : (
       <table style={{ width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr style={{ background: "#fafcfa" }}>
      {["رقم الطلب", "المنتجات", "إجمالي البيع", "صافي أرباحك", "التاريخ", "الحالة"].map((h, i) => (
        <th key={i} style={{
          padding: "12px 16px", fontSize: 12,
          color: "#888", fontWeight: 600, textAlign: "right",
          borderBottom: "1px solid #f0f0f0"
        }}>{h}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {deliveredOrders.map((order, i) => (
      <tr key={order._id} style={{ background: i % 2 === 0 ? "#fff" : "#fafcfa" }}>

        <td style={{ padding: "12px 16px", fontSize: 13, color: "#555", fontFamily: "monospace" }}>
          ORD-{order._id.slice(-6).toUpperCase()}
        </td>

        <td style={{ padding: "12px 16px", fontSize: 13, color: "#333" }}>
          {order.items?.map((item, j) => (
            <div key={j}>{item.product?.name || "منتج"} × {item.quantity}</div>
          ))}
        </td>

        <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>
          {(order.subtotal || 0).toLocaleString("ar-EG")} جنيه
        </td>

        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#2e7d32" }}>
          {(order.netAmount || 0).toLocaleString("ar-EG")} جنيه
          <div style={{ fontSize: 11, color: "#f97316", fontWeight: 400 }}>
            عمولة: {(order.platformFee || 0).toLocaleString("ar-EG")} جنيه
          </div>
        </td>

        <td style={{ padding: "12px 16px", fontSize: 12, color: "#888" }}>
          {new Date(order.createdAt).toLocaleDateString("ar-EG", {
            year: "numeric", month: "short", day: "numeric"
          })}
        </td>

        <td style={{ padding: "12px 16px" }}>
          <span style={{
            background: "#e8f5e9", color: "#2e7d32",
            padding: "3px 10px", borderRadius: 20,
            fontSize: 12, fontWeight: 700
          }}>
            ✅ مكتمل
          </span>
        </td>

      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>

      </div>
  );
}