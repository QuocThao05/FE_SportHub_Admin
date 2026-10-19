import axiosClient from "../config/axios/axiosClient";

const userManagementService = {
    // Fetch all users
    getAllUsers: () => {
        return axiosClient.get("/users/all"); // Gọi API lấy tất cả người dùng
    },
    
    // Update user status (active/inactive)
    updateUserStatus: (userId, data) => {
        return axiosClient.patch(`/users/${userId}/status`, data); // Gọi API cập nhật trạng thái người dùng
    },

    // Các API khác như getUserById, createUser, deleteUser có thể thêm vào sau
}

export default userManagementService;
