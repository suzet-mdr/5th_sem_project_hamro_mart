export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category_name?: string;
  brand: string;
  size: string;
  color: string;
  cost_price?: number; // Only for Admin
  selling_price: number;
  quantity: number;
  supplier: string;
  image_url: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  points: number;
  created_at: string;
}

export interface Sale {
  id: number;
  customer_id: number | null;
  customer_name?: string;
  user_id: number;
  staff_name?: string;
  total_amount: number;
  discount: number;
  tax: number;
  profit?: number; // Only for Admin
  payment_method: string;
  timestamp: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  selling_price: number;
  cost_price?: number;
}
