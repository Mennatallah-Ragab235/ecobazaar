import axios from "axios";

// services/shipping.service.js


export const shipWithMock = async (orderData) => {
  try {
    console.log("🚚 Mock shipping for order:", orderData._id);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      return { success: false, message: "Mock shipping failed" };
    }

    const trackingNumber = `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
      success: true,
      trackingNumber,   // ← مباشرة على result مش جوه data
      status: "shipped",
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };

  } catch (error) {
    return { success: false, message: "Mock shipping error" };
  }
};







