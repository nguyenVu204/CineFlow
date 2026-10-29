import { apiClient } from './client';
import { ConcessionItem } from '../../types/concession';
import { AdminFnb } from '../../types/admin';

export interface BackendConcession {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  imageUrl: string;
  inStock: boolean;
}

export const concessionApi = {
  async getConcessions(inStockOnly = false): Promise<ConcessionItem[]> {
    try {
      const response = await apiClient.get<BackendConcession[]>('/api/concessions', {
        params: { inStockOnly }
      });
      return response.data.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        desc: c.description,
        price: c.price,
        icon: c.icon
      }));
    } catch {
      return [];
    }
  },

  async getAdminFnb(): Promise<AdminFnb[]> {
    try {
      const response = await apiClient.get<BackendConcession[]>('/api/concessions');
      return response.data.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        desc: c.description,
        price: c.price,
        inStock: c.inStock
      }));
    } catch {
      return [];
    }
  },

  async createConcession(data: { name: string; description: string; price: number; icon?: string; inStock?: boolean }): Promise<AdminFnb> {
    const response = await apiClient.post<BackendConcession>('/api/concessions', {
      name: data.name,
      description: data.description,
      price: data.price,
      icon: data.icon || 'fa-popcorn',
      inStock: data.inStock ?? true
    });
    return {
      id: response.data.id.toString(),
      name: response.data.name,
      desc: response.data.description,
      price: response.data.price,
      inStock: response.data.inStock
    };
  },

  async updateConcession(id: string | number, data: { name: string; description: string; price: number; inStock: boolean }): Promise<void> {
    await apiClient.put(`/api/concessions/${id}`, {
      name: data.name,
      description: data.description,
      price: data.price,
      inStock: data.inStock
    });
  },

  async deleteConcession(id: string | number): Promise<void> {
    await apiClient.delete(`/api/concessions/${id}`);
  },

  async toggleStock(id: string | number): Promise<AdminFnb> {
    const response = await apiClient.patch<BackendConcession>(`/api/concessions/${id}/stock`);
    return {
      id: response.data.id.toString(),
      name: response.data.name,
      desc: response.data.description,
      price: response.data.price,
      inStock: response.data.inStock
    };
  }
};

