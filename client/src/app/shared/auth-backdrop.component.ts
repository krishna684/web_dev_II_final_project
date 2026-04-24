import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Decorative pink dots scattered behind the auth hero copy —
 * the playful "dating app" decoration from modern reference designs.
 * Actual positioning / coloring lives in styles.css under .auth-left .deco-dot.
 */
@Component({
  selector: 'app-auth-backdrop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="deco-dot d1"></div>
    <div class="deco-dot d2"></div>
    <div class="deco-dot d3"></div>
  `,
})
export class AuthBackdropComponent {}
