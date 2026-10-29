import { apiClient } from './client';

export interface PaymentCreationResponse {
  transactionId: string;
  bookingId: number;
  paymentMethod: string;
  amount: number;
  paymentUrl: string;
  qrCodeUrl: string;
  expiresAt: string;
  status: string;
}

export const paymentApi = {
  async createPayment(bookingId: number, paymentMethod: string, returnUrl?: string): Promise<PaymentCreationResponse> {
    const response = await apiClient.post<PaymentCreationResponse>('/api/payments/create', {
      bookingId,
      paymentMethod,
      returnUrl
    });
    return response.data;
  },

  async getPaymentStatus(transactionId: string): Promise<PaymentCreationResponse> {
    const response = await apiClient.get<PaymentCreationResponse>(`/api/payments/${transactionId}/status`);
    return response.data;
  },

  async confirmPayment(transactionId: string): Promise<{ success: boolean; transactionId: string; status: string }> {
    const response = await apiClient.post(`/api/payments/${transactionId}/confirm`);
    return response.data;
  }
};

