import axiosClient, { tokenStorage } from '../config/axios/axiosClient'


const authService = {

  register: (data) => {
    return axiosClient.post("/auth/sign-up", data);
  },

  resendEmail: ({email}) => {
    return axiosClient.post(`/auth/resend-verification?email=${email}`);
  },

  login: async (data) => {
    const res = await axiosClient.post("/auth/sign-in", data);
    if (res.data?.data?.accessToken) {
      tokenStorage.setAccess(res.data.data.accessToken);
    }
    if (res.data?.data?.refreshToken) {
      tokenStorage.setRefresh(res.data.data.refreshToken);
    }
    return res;
  },

  logout: async () => {
    try {
      await axiosClient.post("/auth/logout");
    } finally {
      tokenStorage.clear();
    }
  },

  // lấy thông tin user hiện tại
  getCurrentUser: () => {
    return axiosClient.get("/auth/me");
  },
  
  loginWithGoogle: async (data) => {
    const res = await axiosClient.post("/auth/firebase-sign-in", data);
    if (res.data?.data?.accessToken) {
      tokenStorage.setAccess(res.data.data.accessToken);
    }
    if (res.data?.data?.refreshToken) {
      tokenStorage.setRefresh(res.data.data.refreshToken);
    }
    return res;
  },



};

export default authService;
