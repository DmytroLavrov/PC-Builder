import { computed, effect, Injectable, signal } from '@angular/core';
import { Category, PCBuild, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class BuilderService {
  public build = signal<PCBuild>({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
  });

  constructor() {
    // LOADING: At startup, we try to get data
    const saved = localStorage.getItem('pc-build');
    if (saved) {
      try {
        this.build.set(JSON.parse(saved));
      } catch (e) {
        console.error('Corrupted save file');
      }
    }

    // SAVE: Automatically save with every change
    effect(() => {
      const currentBuild = this.build();
      localStorage.setItem('pc-build', JSON.stringify(currentBuild));
    });
  }

  public totalPrice = computed(() => {
    const b = this.build();
    return Object.values(b)
      .filter((p): p is Product => p !== null)
      .reduce((total, product) => total + product.price, 0);
  });

  public totalWattage = computed(() => {
    const b = this.build();
    // Assume the base system consumption is 50W
    let total = 50;
    Object.values(b).forEach((p) => {
      if (p?.specs.wattage) total += p.specs.wattage;
    });
    return total;
  });

  public compatibilityIssues = computed(() => {
    const b = this.build();
    const errors: string[] = [];

    // Check: Processor <-> Motherboard (Socket)
    if (b.cpu && b.motherboard) {
      if (b.cpu.specs.socket !== b.motherboard.specs.socket) {
        errors.push(
          `Incompatibility: CPU requires socket ${b.cpu.specs.socket}, and motherboard has ${b.motherboard.specs.socket}`,
        );
      }
    }

    // Check: RAM <-> Motherboard (DDR type)
    if (b.ram && b.motherboard) {
      if (b.ram.specs.memoryType !== b.motherboard.specs.memoryType) {
        errors.push(
          `Incompatibility: Board supports ${b.motherboard.specs.memoryType}, and memory ${b.ram.specs.memoryType}`,
        );
      }
    }

    // Check: Power supply (is there enough power)
    if (b.psu && b.psu.specs.wattage! < this.totalWattage()) {
      errors.push(
        `Warning: Power supply too weak! Consumption: ${this.totalWattage()}W, PSU: ${b.psu.specs.wattage}W`,
      );
    }

    // Check: CASE vs BOARD
    if (b.case && b.motherboard) {
      const caseSize = b.case.specs.formFactor;
      const boardSize = b.motherboard.specs.formFactor;
      if (caseSize === 'Micro-ATX' && boardSize === 'ATX') {
        errors.push(
          `Physical incompatibility: Board ${boardSize} will not fit in case ${caseSize}!`,
        );
      }

      if (caseSize === 'Mini-ITX' && (boardSize === 'ATX' || boardSize === 'Micro-ATX')) {
        errors.push(`The board is too big for this Mini-ITX case.`);
      }
    }

    return errors;
  });

  public filterProducts(category: Category, allProducts: Product[]): Product[] {
    const b = this.build();
    let products = allProducts.filter((p) => p.category === category);

    // 1. Motherboard filter by CPU
    if (category === 'motherboard' && b.cpu) {
      products = products.filter((p) => p.specs.socket === b.cpu?.specs.socket);
    }

    // 2. CPU filter by Motherboard (if the board was selected first)
    if (category === 'cpu' && b.motherboard) {
      products = products.filter((p) => p.specs.socket === b.motherboard?.specs.socket);
    }

    // 3. RAM filter by Materynka
    if (category === 'ram' && b.motherboard) {
      products = products.filter((p) => p.specs.memoryType === b.motherboard?.specs.memoryType);
    }

    return products;
  }

  public selectProduct(category: Category, product: Product): void {
    this.build.update((current) => ({
      ...current,
      [category]: product,
    }));
  }

  public removeProduct(category: Category): void {
    this.build.update((current) => ({
      ...current,
      [category]: null,
    }));
  }
}
