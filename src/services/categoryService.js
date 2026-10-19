import axiosClient from "../config/axios/axiosClient";

const CATEGORY_API = "/categories";

const categoryService = {
  // 🔹 Lấy danh sách tất cả danh mục
  getAll: () => axiosClient.get(CATEGORY_API),

  // 🔹 Tạo danh mục mới
  create: (data) => axiosClient.post(CATEGORY_API, data),

  // 🔹 Cập nhật danh mục theo ID
  update: (id, data) => axiosClient.put(`${CATEGORY_API}/${id}`, data),

  // 🔹 Xóa danh mục (nếu backend có endpoint này)
  delete: (id) => axiosClient.delete(`${CATEGORY_API}/${id}`),

  // 🔹 Tìm kiếm danh mục theo tên
  search: (keyword) =>
    axiosClient.get(`${CATEGORY_API}/search`, {
      params: { ten: keyword },
    }),
};

export default categoryService;