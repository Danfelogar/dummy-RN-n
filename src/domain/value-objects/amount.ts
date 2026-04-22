export class Amount {
  constructor(private readonly value: number) {
    if (value <= 0) throw new Error('Invalid amount');
  }

  getValue(): number {
    return this.value;
  }
}
