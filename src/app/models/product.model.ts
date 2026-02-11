export type Category = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case';

export interface BaseProduct {
  id: number;
  name: string;
  price: number;
  category: Category;
  image: string;
}

export interface CpuProduct extends BaseProduct {
  category: 'cpu';
  specs: {
    socket: string;
    wattage: number;
    cores?: number;
    threads?: number;
    baseClock?: string;
  };
}

export interface MotherboardProduct extends BaseProduct {
  category: 'motherboard';
  specs: {
    socket: string;
    memoryType: string;
    formFactor: string;
    chipset?: string;
  };
}

export interface RamProduct extends BaseProduct {
  category: 'ram';
  specs: {
    memoryType: string;
    capacity: string;
    speed?: string;
    latency?: string;
    wattage: number;
  };
}

export interface GpuProduct extends BaseProduct {
  category: 'gpu';
  specs: {
    vram: string;
    length: number;
    wattage: number;
  };
}

export interface StorageProduct extends BaseProduct {
  category: 'storage';
  specs: {
    type: 'SSD' | 'HDD';
    interface: 'M.2' | 'SATA';
    capacity: string;
    wattage: number;
  };
}

export interface PsuProduct extends BaseProduct {
  category: 'psu';
  specs: {
    wattage: number;
    modular?: boolean;
    efficiency?: string;
  };
}

export interface CaseProduct extends BaseProduct {
  category: 'case';
  specs: {
    formFactor: string;
    maxGpuLength: number;
    maxCpuCoolerHeight?: number;
  };
}

export type Product =
  | CpuProduct
  | MotherboardProduct
  | RamProduct
  | GpuProduct
  | StorageProduct
  | PsuProduct
  | CaseProduct;

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  [key: string]: string | number | undefined;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export interface PCBuild {
  cpu: CpuProduct | null;
  motherboard: MotherboardProduct | null;
  ram: RamProduct | null;
  gpu: GpuProduct | null;
  storage: StorageProduct | null;
  psu: PsuProduct | null;
  case: CaseProduct | null;
}

export interface SavedBuild {
  id: string;
  name: string;
  build: PCBuild;
  createdAt: number;
  updatedAt: number;
}
