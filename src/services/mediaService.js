import axiosClient from "../config/axios/axiosClient";
import axios from "axios"; 

const MEDIA_ENDPOINT = "/v1/media";

const mediaService = {

 
    generateUploadUrl: async (originalFileName, contentType, mediaType) => {
        const response = await axiosClient.post(`${MEDIA_ENDPOINT}/upload-url`, {
            originalFileName,
            contentType,
            mediaType,
        });
        // Giả định ApiResponse của Backend chứa data
        console.log("Full Upload Response:", response.data);
        return response.data;
    },


    uploadFileToS3: async (preSignedUrl, file, contentType) => {
        await axios.put(preSignedUrl, file, {
            headers: {
                'Content-Type': contentType,
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            },
        });
    },


};

export default mediaService;