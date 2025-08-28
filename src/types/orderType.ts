type OrderItem = {
  id: string;
  created_at: string;
  product_id: string | null;
  quantity: number;
  price: number;
  discount_percentage: number | null;
  name: string;
  sku: string;
  detail: string;
  image: string;
  category: string;
  sold: number;
  review: string | null;
  rating: string | null;
  user_id?: string;
  final_price?: number;
};

type TotalPrice = {
  final_price: number;
}[];

export type { OrderItem, TotalPrice };
