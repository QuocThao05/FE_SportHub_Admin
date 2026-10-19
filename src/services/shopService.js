// src/services/shopService.js
import axiosClient from "../config/axios/axiosClient";

const shopService = {
  getAllShops: () => {
    return axiosClient.get("/shops").then((res) => res.data?.data ?? res.data ?? []);
  },

  createShop: (data) => {
    return axiosClient.post("/shops", data).then((res) => res.data?.data ?? res.data);
  },

  // Update Address API
  updateAddress: (data) => {
    return axiosClient.put("/shops/address", data).then((res) => res.data?.data ?? res.data);
  },
};

export default shopService;
