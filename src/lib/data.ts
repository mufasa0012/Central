export const products = [
  { id: "1", name: "Maize Flour", brand: "Soko", price: 210, category: "Grains", image: "https://placehold.co/300x300", hint: "maize flour", stock: 100, unit: "2kg" },
  { id: "2", name: "Maize Flour", brand: "Ajab", price: 205, category: "Grains", image: "https://placehold.co/300x300", hint: "maize flour", stock: 120, unit: "2kg" },
  { id: "3", name: "Cooking Oil", brand: "Fresh Fri", price: 350, category: "Pantry", image: "https://placehold.co/300x300", hint: "cooking oil", stock: 80, unit: "1 Litre" },
  { id: "4", name: "Milk", brand: "Brookside", price: 65, category: "Dairy", image: "https://placehold.co/300x300", hint: "milk dairy", stock: 75, unit: "500ml" },
  { id: "5", name: "Bread", brand: "Supa Loaf", price: 70, category: "Bakery", image: "https://placehold.co/300x300", hint: "bread bakery", stock: 50, unit: "400g" },
  { id: "6", name: "Yogurt", brand: "Delamere", price: 150, category: "Dairy", image: "https://placehold.co/300x300", hint: "yogurt dairy", stock: 65, unit: "400ml" },
  { id: "7", name: "Soap", brand: "Geisha", price: 50, category: "Detergents", image: "https://placehold.co/300x300", hint: "soap bar", stock: 200, unit: "piece" },
  { id: "8", name: "Rice", brand: "Daawat", price: 400, category: "Grains", image: "https://placehold.co/300x300", hint: "rice grain", stock: 90, unit: "2kg" },
  { id: "9", name: "Sugar", brand: "Kabras", price: 420, category: "Pantry", image: "https://placehold.co/300x300", hint: "sugar pantry", stock: 150, unit: "2kg" },
  { id: "10", name: "Soda", brand: "Coca-Cola", price: 40, category: "Beverages", image: "https://placehold.co/300x300", hint: "soda beverage", stock: 300, unit: "300ml" },
];

export type Product = (typeof products)[0];

export const loyaltyMembers = [
  { id: "CUST001", name: "John Doe", email: "john.doe@example.com", points: 1250 },
  { id: "CUST002", name: "Jane Smith", email: "jane.smith@example.com", points: 850 },
  { id: "CUST003", name: "Alice Johnson", email: "alice.j@example.com", points: 2400 },
  { id: "CUST004", name: "Robert Brown", email: "robert.brown@example.com", points: 450 },
  { id: "CUST005", name: "Emily Davis", email: "emily.d@example.com", points: 3000 },
];
