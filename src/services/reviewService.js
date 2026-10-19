import axiosClient from "../config/axios/axiosClient";

const reviewService = {

    // Lấy tất cả review
    getAll(params) {
        return axiosClient.get("/admin/reviews", {
            params
        });
    },


    // Ẩn review
    hide(id) {
        return axiosClient.put(
            `/admin/reviews/${id}/hide`
        );
    },


    // Hiển thị lại review
    show(id) {
        return axiosClient.put(
            `/admin/reviews/${id}/show`
        );
    },


    // Xóa review
    delete(id) {
        return axiosClient.delete(
            `/admin/reviews/${id}`
        );
    }

};

export default reviewService;