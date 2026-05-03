import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-persona-orb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orb-wrap" [style.width.px]="size" [style.height.px]="size">
      <div class="ring" [style.background]="conicBg"></div>
      <div class="inner" [style.inset.px]="3">
        <span class="letter" [style.font-size.px]="size * 0.42" [style.background]="linearBg">{{ initial }}</span>
      </div>
    </div>
  `,
  styles: [`
    .orb-wrap { position: relative; border-radius: 50%; }
    .ring { position: absolute; inset: 0; border-radius: 50%; animation: orb-spin 14s linear infinite; }
    .inner {
      position: absolute; border-radius: 50%; background: var(--card);
      display: grid; place-items: center; overflow: hidden;
    }
    .letter {
      font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.02em;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
    }
    @keyframes orb-spin { to { transform: rotate(360deg); } }
  `],
})
export class PersonaOrbComponent {
  @Input() initial = '?';
  @Input() hue = 265;
  @Input() size = 54;

  get conicBg(): string {
    const h = this.hue;
    return `conic-gradient(from 0deg, hsl(${h} 80% 65%), hsl(${(h + 80) % 360} 80% 65%), hsl(${(h + 160) % 360} 80% 65%), hsl(${h} 80% 65%))`;
  }
  get linearBg(): string {
    const h = this.hue;
    return `linear-gradient(135deg, hsl(${h} 80% 65%), hsl(${(h + 80) % 360} 80% 65%))`;
  }
}
