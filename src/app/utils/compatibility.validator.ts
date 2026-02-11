import { PCBuild } from '@models/product.model';

export class CompatibilityValidator {
  static validate(build: PCBuild, totalWattage: number): string[] {
    const errors: string[] = [];
    const b = build;

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

    // Check: Power supply
    if (b.psu) {
      const psuW = b.psu.specs.wattage || 0;
      // Recommended margin +20%
      const recommended = Math.ceil(totalWattage * 1.2);

      if (psuW < totalWattage) {
        errors.push(`CRITICAL: PSU is too weak! System uses ${totalWattage}W, PSU has ${psuW}W.`);
      } else if (psuW < recommended) {
        errors.push(`Warning: Low PSU headroom. Recommended: ${recommended}W (+20% buffer).`);
      }
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

    // Check: GPU Length vs Case
    if (b.case && b.gpu && b.case.specs.maxGpuLength && b.gpu.specs.length) {
      if (b.gpu.specs.length > b.case.specs.maxGpuLength) {
        errors.push(
          `Physical: GPU is too long (${b.gpu.specs.length}mm)! Case max: ${b.case.specs.maxGpuLength}mm.`,
        );
      }
    }

    return errors;
  }
}
