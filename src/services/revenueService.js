import axiosClient from "../config/axios/axiosClient";

const revenueService = {
  getRevenueSummary: async (from, to, groupBy = "day") => {
    let url = `/revenue/summary?groupBy=${groupBy}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    
    const res = await axiosClient.get(url);
    return res.data?.data;
  }
};

export default revenueService;
