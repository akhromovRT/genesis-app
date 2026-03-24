export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  code: string;
  price: number; // in kopecks
  description: string;
  full_description: string;
  markers_count: number | null;
  turnaround_days: number | null;
  biomaterial: string;
  is_active: boolean;
  is_popular: boolean;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestWithCategory extends Test {
  categories: Category;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes: string;
  payment_id: string | null;
  payment_status: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "ready"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  test_id: string;
  test_name: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  order_id: string;
  order_item_id: string | null;
  user_id: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  description: string;
  uploaded_by: string | null;
  created_at: string;
}
