import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'home' | 'user' | 'heart' | 'graph' | 'clock' | 'bell'
  | 'sun' | 'moon' | 'plus' | 'edit' | 'trash' | 'x' | 'check'
  | 'arr' | 'arrR' | 'arrL' | 'search' | 'spark' | 'star'
  | 'wave' | 'filter' | 'share' | 'save' | 'refresh';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 24 24" class="ico" [class.ico-lg]="large" [ngSwitch]="name">
      <ng-container *ngSwitchCase="'home'"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></ng-container>
      <ng-container *ngSwitchCase="'user'"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></ng-container>
      <ng-container *ngSwitchCase="'heart'"><path d="M12 21s-8-5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-8 11-10 11z"/></ng-container>
      <ng-container *ngSwitchCase="'graph'"><circle cx="5" cy="6" r="2.3"/><circle cx="19" cy="7" r="2.3"/><circle cx="18" cy="18" r="2.3"/><circle cx="7" cy="17" r="2.3"/><circle cx="12" cy="11" r="2.3"/><path d="M7 7l4 3M12 11l5-3M12 11l5 6M7 16l4-4"/></ng-container>
      <ng-container *ngSwitchCase="'clock'"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></ng-container>
      <ng-container *ngSwitchCase="'bell'"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></ng-container>
      <ng-container *ngSwitchCase="'sun'"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></ng-container>
      <ng-container *ngSwitchCase="'moon'"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></ng-container>
      <ng-container *ngSwitchCase="'plus'"><path d="M12 5v14M5 12h14"/></ng-container>
      <ng-container *ngSwitchCase="'edit'"><path d="M4 20h4l11-11-4-4L4 16v4z"/></ng-container>
      <ng-container *ngSwitchCase="'trash'"><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/></ng-container>
      <ng-container *ngSwitchCase="'x'"><path d="M6 6l12 12M18 6L6 18"/></ng-container>
      <ng-container *ngSwitchCase="'check'"><path d="M5 12l5 5 9-11"/></ng-container>
      <ng-container *ngSwitchCase="'arr'"><path d="M5 12h14M13 6l6 6-6 6"/></ng-container>
      <ng-container *ngSwitchCase="'arrR'"><path d="M9 6l6 6-6 6"/></ng-container>
      <ng-container *ngSwitchCase="'arrL'"><path d="M15 6l-6 6 6 6"/></ng-container>
      <ng-container *ngSwitchCase="'search'"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></ng-container>
      <ng-container *ngSwitchCase="'spark'"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></ng-container>
      <ng-container *ngSwitchCase="'star'"><path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17.3 6.4 20.4 7.8 14 3 9.6l6.4-.6z"/></ng-container>
      <ng-container *ngSwitchCase="'wave'"><path d="M3 12c3-6 6-6 9 0s6 6 9 0"/></ng-container>
      <ng-container *ngSwitchCase="'filter'"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></ng-container>
      <ng-container *ngSwitchCase="'share'"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></ng-container>
      <ng-container *ngSwitchCase="'save'"><path d="M5 3h11l3 3v15H5zM8 3v5h8V3"/></ng-container>
      <ng-container *ngSwitchCase="'refresh'"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></ng-container>
    </svg>
  `,
  styles: [`:host { display: inline-flex; align-items: center; }`],
})
export class IconComponent {
  @Input() name: IconName = 'spark';
  @Input() large = false;
}
