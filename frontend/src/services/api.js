import axios from 'axios'
import useAuthStore from '../store/authStore'

// Single axios instance shared by all services.
const api = axios.create({ baseURL: '/api' })

// On an expired/invalid token, clear auth and bounce to login once.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
