import axios from 'axios';
import { Fighter, FighterFilters } from '../../types/fighter';
import { environment } from '../../config/environment';


const api = axios.create({
    baseURL: environment.API_BASE_URL,
    timeout: environment.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Only add interceptors in development
if (environment.DEBUG_MODE) {
    api.interceptors.request.use(
        (config) => {
            console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
            return config;
        },
        (error) => {
            console.error('❌ API Request Error:', error);
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => {
            console.log('✅ API Response:', response.status, response.config.url);
            return response;
        },
        (error) => {
            console.error('❌ API Response Error:', error.response?.status, error.config?.url);
            return Promise.reject(error);
        }
    );
}

export const fighterApi = {
    async getFighters(params?: FighterFilters & { page?: number; limit?: number }) {
        const response = await api.get('/fighters', { params });
        return response.data;
    },

    async getFighterById(id: number): Promise<Fighter> {
        const response = await api.get(`/fighters/${id}`);
        return response.data;
    },

    async createFighter(fighter: Omit<Fighter, 'id' | 'crearedAt' | 'updateAt'>): Promise<Fighter> {
        const response = await api.post('/fighters', fighter);
        return response.data;
    },

    async updatedFighter(id: number, updates: Partial<Fighter>): Promise<Fighter> {
        const response = await api.put(`/fighters/${id}`, updates);
        return response.data;
    },

    async deleteFighter(id: number): Promise<void> {
        await api.delete(`fighters/${id}`);
    },
};