import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { MatchService } from '../../services/match.service';
import { PersonaService } from '../../services/persona.service';
import { Match } from '../../models/match.model';
import { Persona } from '../../models/persona.model';
import { IconComponent } from '../../shared/icon.component';
import { ReportPanelComponent } from '../report-panel/report-panel.component';
import { ToastService } from '../../shared/toast.service';
import { hueOf, initialOf, ownerPossessive } from '../../shared/persona-helpers';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-match-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent, ReportPanelComponent],
  templateUrl: './match-dashboard.component.html',
})
export class MatchDashboardComponent implements OnInit {
  sorted$: Observable<Match[]>;
  selected: Match | null = null;
  drawerMatch: Match | null = null;
  rescoring = false;
  currentUserId = '';

  ownerPossessive = ownerPossessive;

  constructor(
    private matches: MatchService,
    private personas: PersonaService,
    private toast: ToastService,
    private auth: AuthService,
  ) {
    this.sorted$ = this.matches.matches$.pipe(
      map(list => [...list].sort((a, b) => b.score - a.score))
    );
  }

  ngOnInit(): void {
    this.auth.user$.subscribe(u => { this.currentUserId = u?.id || ''; });
    this.personas.load().subscribe();
    this.matches.load().subscribe(list => {
      if (list.length) this.selected = [...list].sort((a, b) => b.score - a.score)[0];
    });
  }

  pick(m: Match): void { this.selected = m; }

  personaOf(m: Match | null, side: 'a' | 'b'): Persona | null {
    if (!m) return null;
    const v = side === 'a' ? m.personaAId : m.personaBId;
    return typeof v === 'string' ? null : v;
  }

  hue(m: Match | null, side: 'a' | 'b'): number { return hueOf(this.personaOf(m, side)); }
  init(m: Match | null, side: 'a' | 'b'): string { return initialOf(this.personaOf(m, side)); }
  name(m: Match | null, side: 'a' | 'b'): string { return this.personaOf(m, side)?.name || '…'; }

  sharedChips(m: Match | null): string[] {
    const a = this.personaOf(m, 'a'); const b = this.personaOf(m, 'b');
    if (!a || !b) return [];
    const setB = new Set([...(b.traits || []), ...(b.interests || [])].map(x => x.toLowerCase()));
    return Array.from(new Set(
      [...(a.traits || []), ...(a.interests || [])].filter(x => setB.has(x.toLowerCase()))
    ));
  }

  openReport(m: Match | null): void {
    if (!m) return;
    this.drawerMatch = m;
  }

  closeReport(): void { this.drawerMatch = null; }

  rescoreAll(): void {
    this.rescoring = true;
    this.matches.rescoreAll().subscribe({
      next: (res) => {
        this.toast.push(`Re-scored ${res.rescored} pairs`, 'success');
        this.matches.load().subscribe();
        this.rescoring = false;
      },
      error: (err) => {
        this.toast.push(err?.error?.error || 'Re-score failed', 'error');
        this.rescoring = false;
      },
    });
  }
}
