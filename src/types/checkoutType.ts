interface Item {
  created_at: string;
  quantity: number;
  name: string;
  price: number;
  discount_percentage: number;
  final_price: number;
  total: number;
}

interface OrderData {
  amount: number;
  items: Item[];
}

export type { OrderData, Item };
