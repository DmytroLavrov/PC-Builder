import { Product } from '@models/product.model';

export const PRODUCTS: Product[] = [
  // --- PROCESSORS (CPU) ---
  {
    id: 1,
    name: 'Intel Core i9-14900K',
    price: 620,
    category: 'cpu',
    image: 'https://via.placeholder.com/150?text=Intel+i9',
    specs: { socket: 'LGA1700', wattage: 253 },
  },
  {
    id: 2,
    name: 'AMD Ryzen 7 7800X3D',
    price: 450,
    category: 'cpu',
    image: 'https://via.placeholder.com/150?text=Ryzen+7',
    specs: { socket: 'AM5', wattage: 120 },
  },

  // --- MOTHERBOARDS ---
  {
    id: 3,
    name: 'ASUS ROG Maximus Z790',
    price: 700,
    category: 'motherboard',
    image: 'https://via.placeholder.com/150?text=Z790',
    specs: { socket: 'LGA1700', memoryType: 'DDR5' },
  },
  {
    id: 4,
    name: 'MSI MAG B650 Tomahawk',
    price: 220,
    category: 'motherboard',
    image: 'https://via.placeholder.com/150?text=B650',
    specs: { socket: 'AM5', memoryType: 'DDR5' },
  },

  // --- RAM ---
  {
    id: 5,
    name: 'Kingston Fury Beast 32GB DDR5',
    price: 150,
    category: 'ram',
    image: 'https://via.placeholder.com/150?text=DDR5',
    specs: { memoryType: 'DDR5', wattage: 10 },
  },
  {
    id: 6,
    name: 'G.Skill Ripjaws V 16GB DDR4',
    price: 50,
    category: 'ram',
    image: 'https://via.placeholder.com/150?text=DDR4',
    specs: { memoryType: 'DDR4', wattage: 5 }, // Especially for the error test!
  },

  // --- VIDEO CARDS (GPU) ---
  {
    id: 7,
    name: 'NVIDIA GeForce RTX 4090',
    price: 1800,
    category: 'gpu',
    image: 'https://via.placeholder.com/150?text=RTX+4090',
    specs: { wattage: 450 },
  },
  {
    id: 8,
    name: 'NVIDIA GeForce RTX 4060',
    price: 300,
    category: 'gpu',
    image: 'https://via.placeholder.com/150?text=RTX+4060',
    specs: { wattage: 115 },
  },

  // --- POWER SUPPLIES (PSU) ---
  {
    id: 9,
    name: 'Corsair RM1000x (1000W)',
    price: 180,
    category: 'psu',
    image: 'https://via.placeholder.com/150?text=1000W',
    specs: { wattage: 1000 },
  },
  {
    id: 10,
    name: 'DeepCool PF500 (500W)',
    price: 40,
    category: 'psu',
    image: 'https://via.placeholder.com/150?text=500W',
    specs: { wattage: 500 }, // Weak battery for the test
  },
];
