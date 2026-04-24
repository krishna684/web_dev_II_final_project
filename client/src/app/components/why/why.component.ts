import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-why',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './why.component.html',
})
export class WhyComponent {}
