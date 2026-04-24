export class MMKV {
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map();
  }

  set(key: string, value: string | number | boolean): void {
    this.storage.set(key, String(value));
  }

  getString(key: string): string | undefined {
    return this.storage.get(key);
  }

  getNumber(key: string): number | undefined {
    const value = this.storage.get(key);
    return value ? Number(value) : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.storage.get(key);
    return value ? value === 'true' : undefined;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  clearAll(): void {
    this.storage.clear();
  }

  contains(key: string): boolean {
    return this.storage.has(key);
  }
}

export const createMMKV = (_config?: any): MMKV => {
  return new MMKV();
};
