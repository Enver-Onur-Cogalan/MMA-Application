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


api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.config?.url);
        console.error('❌ API Error Message:', error.message);
        console.error('❌ API Error Details:', error.response?.data);
        return Promise.reject(error);
    }
);

export const fighterApi = {
    async getFighters(params?: FighterFilters & { page?: number; limit?: number }) {
        try {
            console.log('🎯 getFighters called with params:', params);

            const response = await api.get('/api/fighters', { params });

            if (response.data && response.data.data) {
                console.log('🎯 Found response.data.data');
                console.log('🎯 Fighters array length:', response.data.data.length);
                console.log('🎯 First fighter:', response.data.data[0]);
            }

            return response.data;
        } catch (error) {
            console.error('🎯 getFighters error:', error);
            throw error;
        }
    },

    async getFighterById(id: number): Promise<Fighter> {
        const response = await api.get(`/api/fighters/${id}`);
        return response.data;
    },

    async createFighter(fighter: Omit<Fighter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fighter> {
        const response = await api.post('/api/fighters', fighter);
        return response.data;
    },

    async updateFighter(id: number, updates: Partial<Fighter>): Promise<Fighter> {
        const response = await api.put(`/api/fighters/${id}`, updates);
        return response.data;
    },

    async deleteFighter(id: number): Promise<void> {
        await api.delete(`/api/fighters/${id}`);
    },
};