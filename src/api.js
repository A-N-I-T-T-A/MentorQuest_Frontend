import axios from "axios";

const API = axios.create({
    baseURL: "https://mentorquest-backend.onrender.com/api/",
  });
  
  export default API;
  
