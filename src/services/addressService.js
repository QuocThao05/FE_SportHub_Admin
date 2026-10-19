import axiosClient from '../config/axios/axiosClient'
const addressService = {
  
  getProvinces: async () => {
    return axiosClient.get("/address/provinces").then((res) => res.data?.data ?? res.data ?? []);
  },

  getDistricts: async (provinceId) => {
    if (provinceId === undefined || provinceId === null || provinceId === "") return [];
    return axiosClient.get(`/address/districts/${provinceId}`).then((res) => res.data?.data ?? res.data ?? []);
  },

  getWards: async (districtId) => {
    if (districtId === undefined || districtId === null || districtId === "") return [];
    return axiosClient.get(`/address/wards/${districtId}`).then((res) => res.data?.data ?? res.data ?? []);
  },

  calculateShippingFee: async (payload) => {
    const res = await axiosClient.post("/shipping-fee", payload);
    return res.data?.data || 0;
  }

};

export default addressService;
