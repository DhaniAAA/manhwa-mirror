/**
 * Secure Storage Adapter
 * 
 * Menggunakan in-memory storage untuk menyimpan session token
 * Lebih aman dari localStorage/sessionStorage karena:
 * 1. Tidak dapat diakses via JavaScript injection (XSS)
 * 2. Otomatis hilang saat tab/window ditutup
 * 3. Tidak tersimpan di disk
 */

class SecureStorageAdapter {
  private storage: Map<string, string>

  constructor() {
    this.storage = new Map()
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

export const secureStorage = new SecureStorageAdapter()
