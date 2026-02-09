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
    wattage?: number; // For PSU and other components (power consumption)
    formFactor?: string; // ATX, Micro-ATX, Mini-ITX
    vram?: string; // Video memory size (for GPU, e.g. "8GB", "12GB")
    length?: number; // GPU length in millimeters
    maxGpuLength?: number; // Maximum supported GPU length (for Case), mm
    height?: number; // Cooler height in millimeters (for CPU Cooler)
    maxCpuCoolerHeight?: number; // Maximum supported CPU cooler height (for Case), mm
  };
}

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  [key: string]: string | number | undefined;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

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
