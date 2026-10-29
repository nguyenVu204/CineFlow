import { apiClient } from './client';
import { AdminVoucher } from '../../types/admin';

export interface BackendPromotion {
  id: number;
  code: string;
  title: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  createdAt: string;
}

export interface ValidatePromotionResult {
  valid: boolean;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  discountAmount: number;
  message: string;
}

export const promotionApi = {
  async getPromotions(activeOnly = false): Promise<AdminVoucher[]> {
    try {
      const response = await apiClient.get<BackendPromotion[]>('/api/promotions', {
        params: { activeOnly }
      });
      return response.data.map((p) => ({
        code: p.code,
        title: p.title,
        type: p.discountType,
        value: p.discountValue,
        active: p.isActive
      }));
    } catch {
      return [];
    }
  },

  async validatePromotion(code: string, orderTotal: number, userId?: string): Promise<ValidatePromotionResult> {
    const response = await apiClient.post<ValidatePromotionResult>('/api/promotions/validate', {
      code,
      orderTotal,
      userId
    });
    return response.data;
  },

  async createPromotion(data: {
    code: string;
    title: string;
    discountType: 'fixed' | 'percent';
    discountValue: number;
    minOrderValue?: number;
    isActive?: boolean;
  }): Promise<AdminVoucher> {
    const response = await apiClient.post<BackendPromotion>('/api/promotions', data);
    return {
      code: response.data.code,
      title: response.data.title,
      type: response.data.discountType,
      value: response.data.discountValue,
      active: response.data.isActive
    };
  },

  async deletePromotion(code: string): Promise<void> {
    await apiClient.delete(`/api/promotions/${code}`);
  },

  async togglePromotion(code: string): Promise<AdminVoucher> {
    const response = await apiClient.patch<BackendPromotion>(`/api/promotions/${code}/toggle`);
    return {
      code: response.data.code,
      title: response.data.title,
      type: response.data.discountType,
      value: response.data.discountValue,
      active: response.data.isActive
    };
  }
};

