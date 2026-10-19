import axiosClient from "../config/axios/axiosClient";

const orderService = {
  getAllOrders: async () => {
    const res = await axiosClient.get("/orders");
    return res.data?.data || [];
  },

updateStatusOrder: async (orderId, data) => {
  console.log("PATCH URL:", `/orders/${orderId}/status`);

  const res = await axiosClient.patch(
    `/orders/${orderId}/status`,
    data
  );

  return res.data.data;
},
};

export default orderService;