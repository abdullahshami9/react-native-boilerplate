// Mock Data for junr web app
// Mirrors the structure of the React Native app's backend/database

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_type: 'Individual' | 'Business';
  profile_pic_url: string;
  resume_url?: string;
  business?: BusinessDetails;
}

export interface BusinessDetails {
  business_type: 'Product Based' | 'Service Based';
  company_name?: string;
}

export interface Skill {
  id: number;
  skill_name: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  year: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

export interface SalesReport {
  date: string; // YYYY-MM-DD
  count: number;
  total: number;
}

export interface Appointment {
  id: number;
  appointment_date: string; // YYYY-MM-DD HH:MM:SS
  provider_id: number;
  customer_id: number;
  customer_name: string;
  provider_name: string;
  status: 'confirmed' | 'pending' | 'completed';
}

// --- MOCK USERS ---

export const MOCK_INDIVIDUAL_USER: User = {
  id: 101,
  name: "Jules Engineer",
  email: "jules@junr.app",
  phone: "+1234567890",
  user_type: 'Individual',
  profile_pic_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200",
  resume_url: "resume.pdf"
};

export const MOCK_BUSINESS_USER: User = {
  id: 202,
  name: "Tech Nova Ltd",
  email: "contact@technova.com",
  phone: "+1987654321",
  user_type: 'Business',
  profile_pic_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?fit=crop&w=200&h=200",
  business: {
    business_type: 'Product Based',
    company_name: 'Tech Nova'
  }
};

// --- MOCK DATA LISTS ---

export const MOCK_SKILLS: Skill[] = [
  { id: 1, skill_name: "React Native" },
  { id: 2, skill_name: "Next.js" },
  { id: 3, skill_name: "TypeScript" },
  { id: 4, skill_name: "Node.js" },
  { id: 5, skill_name: "UI/UX Design" }
];

export const MOCK_EDUCATION: Education[] = [
  { id: 1, institution: "Innovation University", degree: "B.S. Computer Science", year: "2019 - 2023" },
  { id: 2, institution: "Tech Academy", degree: "Full Stack Certification", year: "2018" }
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Wireless Earbuds Pro", price: 15000, description: "High fidelity noise cancelling earbuds.", image_url: "https://images.unsplash.com/photo-1572569028738-411a0977d4aa?w=500" },
  { id: 2, name: "Smart Watch Series 5", price: 45000, description: "Track your fitness and stay connected.", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
  { id: 3, name: "Mechanical Keyboard", price: 12000, description: "Clicky tactile switches for professionals.", image_url: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500" },
  { id: 4, name: "Ergonomic Mouse", price: 5000, description: "Reduce wrist strain with this vertical mouse.", image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500" }
];

// Generate last 30 days of sales data
const generateSales = () => {
  const sales: SalesReport[] = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Random sales
    const count = Math.floor(Math.random() * 5); // 0 to 4 sales
    if (count > 0) {
      sales.push({
        date: dateStr,
        count: count,
        total: count * 5000 // Avg order value
      });
    }
  }
  return sales;
};

export const MOCK_SALES_REPORT: SalesReport[] = generateSales();

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointment_date: new Date().toISOString().replace('T', ' ').split('.')[0], // Today
    provider_id: 101,
    customer_id: 303,
    customer_name: "Alice Client",
    provider_name: "Jules Engineer",
    status: 'confirmed'
  },
  {
    id: 2,
    appointment_date: "2023-10-25 14:00:00",
    provider_id: 101,
    customer_id: 304,
    customer_name: "Bob Manager",
    provider_name: "Jules Engineer",
    status: 'completed'
  }
];
