import axiosClient from "../config/axios/axiosClient";


const productService = {
    
    createProduct: (data) => {
        return axiosClient.post("/products", data); 
    },
    
    updateProduct: (id, data) => {
        return axiosClient.put(`/products/${id}`, data); 
    },
    getAllProducts: () => {
        return axiosClient.get("/products"); 
    },
    
    getProductById: (id) => {
        return axiosClient.get(`/products/${id}`); 
    },
    
}
export default productService;