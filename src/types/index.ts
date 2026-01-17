export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    user_type: 'Individual' | 'Business';
    profile_pic_url?: string;
    is_tunnel_completed: boolean;
    address?: string;
    current_job_title?: string;
}

export interface Product {
    id: number;
    user_id: number;
    name: string;
    price: number;
    description: string;
    image_url: string;
    stock_quantity: number;
}

export interface Service {
    id: number;
    user_id: number;
    name: string;
    description: string;
    price: number;
    duration_mins: number;
    image_url: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_name?: string;
    image_url?: string;
}

export interface Order {
    id: number;
    seller_id: number;
    buyer_id: number;
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    buyer_name?: string;
    buyer_phone?: string;
    items?: OrderItem[];
}

export interface Appointment {
    id: number;
    provider_id: number;
    customer_id: number;
    service_id: number;
    appointment_date: string;
    duration_mins: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    provider_name?: string;
    customer_name?: string;
    service_name?: string;
}

export interface ProcurementItem {
    id: number; // product id
    name: string;
    image_url: string;
    total_needed: number;
}

export interface BusinessDetails {
    id: number;
    user_id: number;
    description: string;
    industry: string;
    category: string;
    business_type: 'Service Based' | 'Product Based';
    location_lat: number;
    location_lng: number;
    address: string;
}
