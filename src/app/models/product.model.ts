export type Category = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  image: string;
  specs: {
    socket?: string; // For CPU and Motherboard (e.g. "AM5", "LGA1700")
    memoryType?: string; // For RAM and Motherboard (e.g. "DDR5")
    wattage?: number; // For PSU (power) and others (consumption)
    formFactor?: string; // ATX, Micro-ATX, Mini-ITX
  };
}

// The state of our build
export interface PCBuild {
  cpu: Product | null;
  motherboard: Product | null;
  ram: Product | null;
  gpu: Product | null;
  storage: Product | null;
  psu: Product | null;
  case: Product | null;
}

// Saved build with metadata
export interface SavedBuild {
  id: string;
  name: string;
  build: PCBuild;
  createdAt: number;
  updatedAt: number;
}
