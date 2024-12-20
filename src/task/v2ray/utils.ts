export function transBitToGb(bit: number): number {
  return bit / 1024 / 1024 / 1024
}

export function transGbToBit(gb: number): number {
  return gb * 1024 * 1024 * 1024
}
