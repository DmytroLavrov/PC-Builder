import { computed, Injectable, signal } from '@angular/core';
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

    return errors;
  });

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
