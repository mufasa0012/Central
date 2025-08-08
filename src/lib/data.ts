

export type Product = { 
  id: string; 
  name: string; 
  brand: string; 
  price: number; 
  wholesalePrice?: number; 
  category: string; 
  image: string; 
  hint?: string; 
  stock: number; 
  unit: string; 
};

export type LoyaltyMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  debt: number;
};

export type SaleItem = {
    productId: string;
    name: string;
    brand: string;
    quantity: number;
    price: number;
    total: number;
};

export type Sale = {
    id: string;
    items: SaleItem[];
    subtotal: number;
    total: number;
    paymentMethod: 'Cash' | 'Card' | 'M-Pesa' | 'On Credit';
    status: 'Paid' | 'Refunded' | 'Unpaid';
    customer: {
        id: string;
        name: string;
    };
    createdAt: Date;
};

export type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: Date;
};


// This file is now primarily for type definitions.
// The data is fetched from Firestore in the respective pages.
export const products: Product[] = [];
export const loyaltyMembers: LoyaltyMember[] = [];
