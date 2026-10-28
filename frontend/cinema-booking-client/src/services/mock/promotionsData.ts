import { PromotionItem } from '../../types/promotion';

export const PROMOTIONS_DATA: PromotionItem[] = [
  {
    code: 'CINEMA50',
    title: 'Giảm 50.000đ Cho Đơn Từ 150K',
    desc: 'Áp dụng cho mọi suất chiếu thứ 4 hàng tuần và khách hàng thành viên CINEVERSE Club.',
    discountText: 'GIẢM 50K',
    color: 'red',
    minOrder: 150000,
    type: 'fixed',
    value: 50000
  },
  {
    code: 'HAPPY20',
    title: 'Giảm 20% Suất Chiếu Ban Ngày',
    desc: 'Ưu đãi cho các suất chiếu trước 17:00 các ngày trong tuần từ thứ 2 đến thứ 6.',
    discountText: 'GIẢM 20%',
    color: 'amber',
    type: 'percent',
    value: 20
  },
  {
    code: 'WELCOME30',
    title: 'Chào Bạn Mới - Tặng 30K',
    desc: 'Dành riêng cho khách hàng đăng ký tài khoản mới và đặt vé lần đầu trên hệ thống.',
    discountText: 'TẶNG 30K',
    color: 'emerald',
    type: 'fixed',
    value: 30000
  }
];

export const validatePromoCode = (
  code: string,
  totalAmount: number
): { valid: boolean; discount: number; message: string } => {
  const normalized = code.trim().toUpperCase();
  const promo = PROMOTIONS_DATA.find((p) => p.code === normalized);

  if (!promo) {
    return { valid: false, discount: 0, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
  }

  if (promo.minOrder && totalAmount < promo.minOrder) {
    return {
      valid: false,
      discount: 0,
      message: `Đơn hàng tối thiểu ${promo.minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này.`
    };
  }

  let discount = 0;
  if (promo.type === 'fixed') {
    discount = promo.value;
  } else if (promo.type === 'percent') {
    discount = Math.round((totalAmount * promo.value) / 100);
  }

  return {
    valid: true,
    discount,
    message: `Áp dụng thành công mã ${promo.code}: Giảm ${discount.toLocaleString('vi-VN')}đ!`
  };
};

