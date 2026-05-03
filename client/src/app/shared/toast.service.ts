import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'error' | 'info';
export interface Toast {
  id: string;
  msg: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();

  push(msg: string, kind: ToastKind = 'success'): void {
    const id = Math.random().toString(36).slice(2);
    this.toasts.next([...this.toasts.value, { id, msg, kind }]);
    setTimeout(() => {
      this.toasts.next(this.toasts.value.filter(t => t.id !== id));
    }, 2600);
  }
}
