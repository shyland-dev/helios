import { Injectable, inject } from '@angular/core';
import { DebugService } from '@shyland-dev/utils';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private debugService = inject(DebugService);

  get(key: string): string | null {
    this.debugService.log(this, 'get', key);
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    this.debugService.log(this, 'set', key, value);
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    this.debugService.log(this, 'remove', key);
    localStorage.removeItem(key);
  }

  clear(): void {
    this.debugService.log(this, 'clear');
    localStorage.clear();
  }
}
