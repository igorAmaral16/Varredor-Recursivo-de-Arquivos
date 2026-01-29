import axios from "axios";

export const api = axios.create({
    baseURL: "" // usando proxy do Vite: /api -> localhost:3333
});
