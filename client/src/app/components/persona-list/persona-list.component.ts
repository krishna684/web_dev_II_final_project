import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map, Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { PersonaService } from '../../services/persona.service';
import { Persona } from '../../models/persona.model';
import { IconComponent } from '../../shared/icon.component';
import { PersonaOrbComponent } from '../../shared/persona-orb.component';
import { ToastService } from '../../shared/toast.service';
import { initialOf, hueOf } from '../../shared/persona-helpers';

@Component({
  selector: 'app-persona-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, PersonaOrbComponent],
  templateUrl: './persona-list.component.html',
})
export class PersonaListComponent implements OnInit {
  private queryS = new BehaviorSubject<string>('');
  private moodFilterS = new BehaviorSubject<string>('All');

  moods$: Observable<string[]>;
  filtered$: Observable<Persona[]>;

  initialOf = initialOf;
  hueOf = hueOf;

  get query(): string { return this.queryS.value; }
  set query(v: string) { this.queryS.next(v); }

  get moodFilter(): string { return this.moodFilterS.value; }
  set moodFilter(v: string) { this.moodFilterS.next(v); }

  constructor(
    private service: PersonaService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.moods$ = this.service.personas$.pipe(
      map(list => ['All', ...Array.from(new Set(list.map(p => p.moodTag || '—')))]),
    );
    this.filtered$ = combineLatest([this.service.personas$, this.queryS, this.moodFilterS]).pipe(
      map(([list, q, mood]) => list.filter(p => {
        if (mood !== 'All' && (p.moodTag || '—') !== mood) return false;
        const hay = `${p.name} ${(p.traits || []).join(' ')} ${p.connectionGoal}`.toLowerCase();
        return !q || hay.includes(q.toLowerCase());
      })),
    );
  }

  ngOnInit(): void {
    this.service.load().subscribe();
  }

  openPersona(id: string): void { this.router.navigate(['/personas', id, 'edit']); }
  openDrift(id: string): void { this.router.navigate(['/drift', id]); }

  delete(id: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this persona?')) return;
    this.service.delete(id).subscribe({
      next: () => this.toast.push('Persona deleted', 'info'),
      error: (e) => this.toast.push(e?.error?.error || 'Delete failed', 'error'),
    });
  }
}
