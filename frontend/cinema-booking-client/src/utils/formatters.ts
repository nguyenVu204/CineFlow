export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const getAgeBadgeColor = (ageRating: string): string => {
  switch (ageRating) {
    case 'P':
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    case 'C13':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    case 'C16':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
    case 'C18':
      return 'bg-red-500/20 text-cinema-red border border-red-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/40';
  }
};

