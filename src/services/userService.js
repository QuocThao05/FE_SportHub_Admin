import axiosClient from "../config/axios/axiosClient";

const userService = {

    ChangePassword: (data) => {
        return axiosClient.put("/users/change-password", data); 
    },

    updateProfile: (data) => {
        return axiosClient.put("/users", data); 
    }

}

export default userService;