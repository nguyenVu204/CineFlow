export interface PromotionItem {
  code: string;
  title: string;
  desc: string;
  discountText: string;
  color: 'red' | 'amber' | 'emerald';
  minOrder?: number;
  type: 'fixed' | 'percent';
  value: number;
}

