import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'quote-app-password';

  password = signal<string | null>(this.getStoredPassword());
  isAuthenticated = computed(() => !!this.password());

  private getStoredPassword(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.storageKey);
    }
    return null;
  }

  setPassword(password: string): void {
    this.password.set(password);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, password);
    }
  }

  clearPassword(): void {
    this.password.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}
