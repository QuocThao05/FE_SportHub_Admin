import axiosClient from "../config/axios/axiosClient";

const couponService = {
  getAllCoupons: async () => {
    const res = await axiosClient.get("/coupons");
    return res.data?.data;
  },
  
  createCoupon: async (coupon) => {
    const res = await axiosClient.post("/coupons", coupon);
    return res.data?.data;
  },
  
  updateCoupon: async (id, coupon) => {
    const res = await axiosClient.put(`/coupons/${id}`, coupon);
    return res.data?.data;
  },
  
  deleteCoupon: async (id) => {
    const res = await axiosClient.delete(`/coupons/${id}`);
    return res.data?.data;
  },

  validateCoupon: async (code, orderSubtotal) => {
    const res = await axiosClient.post(`/coupons/validate?code=${code}&orderSubtotal=${orderSubtotal}`);
    return res.data?.data;
  }
};

export default couponService;
