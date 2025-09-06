export interface WishlistProduct {
  id: string;
  created_at: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  discount_percentage: number;
  final_Price: string;
}

export type WishlistProductList = WishlistProduct[];
