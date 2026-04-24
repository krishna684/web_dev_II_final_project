import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toasts">
      <div *ngFor="let t of toast.toasts$ | async" class="toast" [class.success]="t.kind==='success'" [class.error]="t.kind==='error'" [class.info]="t.kind==='info'">
        <span class="tico">
          <app-icon [name]="t.kind === 'success' ? 'check' : t.kind === 'error' ? 'x' : 'spark'"></app-icon>
        </span>
        {{ t.msg }}
      </div>
    </div>
  `,
})
export class ToastHostComponent {
  constructor(public toast: ToastService) {}
}
