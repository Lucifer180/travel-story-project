import axios from "axios";
import { useAuthStore } from '../store/useAuthStore';
import { BASE_URL } from '../utils/constants';

const axiosInstance=axios.create({
    baseURL:BASE_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json",
        
    }
});
axiosInstance.interceptors.request.use(
    (config)=>{
        const accessToken=useAuthStore.getState().token;
        if(accessToken){
            config.headers.Authorization=`Bearer ${accessToken}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);
export default axiosInstance;