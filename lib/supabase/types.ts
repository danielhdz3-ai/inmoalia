export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Partial<Product> & Pick<Product, 'slug' | 'name' | 'price' | 'category'>
        Update: Partial<Product>
      }
      categories: {
        Row: Category
        Insert: Partial<Category> & Pick<Category, 'slug' | 'name'>
        Update: Partial<Category>
      }
      customers: {
        Row: Customer
        Insert: Partial<Customer> & Pick<Customer, 'id'>
        Update: Partial<Customer>
      }
      orders: {
        Row: Order
        Insert: Partial<Order> & Pick<Order, 'order_number' | 'customer_email' | 'items' | 'shipping_address' | 'subtotal' | 'total'>
        Update: Partial<Order>
      }
      sync_logs: {
        Row: SyncLog
        Insert: Partial<SyncLog> & Pick<SyncLog, 'supplier' | 'status'>
        Update: Partial<SyncLog>
      }
      waitlist: {
        Row: Waitlist
        Insert: Partial<Waitlist> & Pick<Waitlist, 'email'>
        Update: Partial<Waitlist>
      }
      favorites: {
        Row: Favorite
        Insert: Partial<Favorite> & Pick<Favorite, 'user_id' | 'product_id'>
        Update: Partial<Favorite>
      }
      coupons: {
        Row: CouponRow
        Insert: Partial<CouponRow> & Pick<CouponRow, 'code' | 'discount_type' | 'discount_value'>
        Update: Partial<CouponRow>
      }
      suppliers: {
        Row: Supplier
        Insert: Partial<Supplier> & Pick<Supplier, 'slug' | 'name'>
        Update: Partial<Supplier>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  cost_price: number | null
  images: string[]
  category: string
  subcategory: string | null
  tags: string[]
  sku: string | null
  supplier_sku: string | null
  supplier: string | null
  supplier_product_url: string | null
  stock: number
  weight_kg: number | null
  dimensions: Json | null
  material: string | null
  color: string | null
  is_active: boolean
  is_featured: boolean
  meta_title: string | null
  meta_desc: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

/** Directorio interno de proveedores (admin). `products.supplier` debe coincidir con `slug`. */
export interface Supplier {
  id: string
  slug: string
  name: string
  legal_name: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  website: string | null
  shipping_info: string | null
  delivery_time: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  full_name: string | null
  phone: string | null
  address: Json | null
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  customer_email: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  stripe_session_id: string | null
  stripe_payment_id: string | null
  items: Json
  shipping_address: Json
  subtotal: number
  shipping_cost: number
  total: number
  supplier_order_id: string | null
  tracking_number: string | null
  notes: string | null
  order_closure_notice_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  supplier: string
  status: 'success' | 'error'
  products_synced: number
  errors: Json | null
  started_at: string
  finished_at: string | null
}

export interface Waitlist {
  id: string
  email: string
  product_id: string | null
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface CouponRow {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface OrderItem {
  product_id: string
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  supplier_sku: string | null
  supplier: string | null
}

export interface ShippingAddress {
  full_name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  province: string
  country: string
}

export interface ProductDimensions {
  width: number
  height: number
  depth: number
}
