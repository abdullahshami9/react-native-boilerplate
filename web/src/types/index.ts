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
    username?: string;
    gender?: string;
    interests?: string[]; // stored as JSON string in DB, parsed here
    resume_url?: string;
    is_private?: boolean;
}

export interface Product {
    id: number;
    user_id: number;
    name: string;
    price: number;
    description: string;
    image_url: string;
    stock_quantity: number;
    delivery_fee?: number;
    is_returnable?: boolean;
    seller_name?: string;
    seller_pic?: string;
}

export interface Service {
    id: number;
    user_id: number;
    name: string;
    description: string;
    price: number;
    duration_mins: number;
    image_url: string;
    service_type?: 'Hourly' | 'Shift' | 'MultiDay';
    service_location?: 'OnSite' | 'Home' | 'Both';
    provider_name?: string;
    provider_pic?: string;
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
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    created_at: string;
    buyer_name?: string;
    buyer_phone?: string;
    items?: OrderItem[];
    payment_method?: string;
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
    card_template?: string;
    card_custom_details?: string;
}

export interface Skill {
    id: number;
    user_id: number;
    skill_name: string;
}

export interface Education {
    id: number;
    user_id: number;
    degree: string;
    institution: string;
    year: string;
    type: 'Degree' | 'Certificate' | 'Diploma';
}

export interface SocialLink {
    id: number;
    user_id: number;
    platform: string;
    url: string;
}

export interface Certificate {
    id: number;
    user_id: number;
    title: string;
    file_url: string;
    created_at: string;
}

export interface PaymentMethod {
    id: number;
    user_id: number;
    provider: string;
    account_number: string;
    account_title: string;
}
