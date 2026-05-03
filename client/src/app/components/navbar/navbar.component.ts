import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';
import { ThemeService } from '../../shared/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="navbar">
      <div class="nav-inner">
        <div class="logo" [routerLink]="'/dashboard'" style="cursor:pointer">
          <div class="logo-mark"></div>
          <div>
            Lumi
            <small>where your selves meet</small>
          </div>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active"><app-icon name="home"></app-icon> Home</a>
          <a routerLink="/personas" routerLinkActive="active"><app-icon name="user"></app-icon> My selves</a>
          <a routerLink="/matches" routerLinkActive="active"><app-icon name="heart"></app-icon> Connections</a>
          <a routerLink="/graph" routerLinkActive="active"><app-icon name="graph"></app-icon> Network</a>
          <a routerLink="/drift" routerLinkActive="active"><app-icon name="clock"></app-icon> History</a>
        </div>
        <div class="nav-right">
          <button class="icon-btn" title="Toggle theme" (click)="theme.toggleTheme()">
            <app-icon [name]="(theme.state$ | async)?.theme === 'dark' ? 'sun' : 'moon'"></app-icon>
          </button>
          <button class="icon-btn" title="Logout" (click)="logout()">
            <app-icon name="x"></app-icon>
          </button>
          <div class="avatar-chip">
            <div class="avatar">{{ initial }}</div>
            <div>
              <div style="font-size:12.5px; font-weight:600">{{ name }}</div>
              <small style="font-size:10.5px">Signed in</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NavbarComponent implements OnInit {
  name = '';
  initial = '?';

  constructor(public theme: ThemeService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.name = u?.name || '';
      this.initial = (u?.name || '?')[0].toUpperCase();
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
