import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DriftService } from '../../services/drift.service';
import { PersonaService } from '../../services/persona.service';
import { Persona, PersonaVersion } from '../../models/persona.model';
import { IconComponent } from '../../shared/icon.component';
import { PersonaOrbComponent } from '../../shared/persona-orb.component';
import { hueOf, initialOf } from '../../shared/persona-helpers';

interface DiffLine {
  kind: 'add' | 'rm' | 'same' | 'change';
  text: string;
}

@Component({
  selector: 'app-drift-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, PersonaOrbComponent],
  templateUrl: './drift-timeline.component.html',
})
export class DriftTimelineComponent implements OnInit, OnDestroy {
  personas: Persona[] = [];
  selectedPersonaId: string | null = null;
  versions: PersonaVersion[] = [];
  loading = false;
  private sub: Subscription | null = null;

  compareMode = false;
  leftVersion: PersonaVersion | null = null;
  rightVersion: PersonaVersion | null = null;

  hueOf = hueOf;
  initialOf = initialOf;

  constructor(
    private drift: DriftService,
    private personaService: PersonaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.personaService.load().subscribe(list => {
      this.personas = list;
    });
    this.sub = this.route.paramMap.subscribe(params => {
      const id = params.get('personaId');
      this.selectedPersonaId = id;
      this.versions = [];
      this.leftVersion = this.rightVersion = null;
      this.compareMode = false;
      if (id) this.loadHistory(id);
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private loadHistory(id: string): void {
    this.loading = true;
    this.drift.loadHistory(id).subscribe({
      next: (list) => {
        this.versions = list;
        this.loading = false;
        if (list.length >= 2) {
          this.leftVersion = list[list.length - 1];
          this.rightVersion = list[0];
        } else if (list.length === 1) {
          this.leftVersion = this.rightVersion = list[0];
        }
      },
      error: () => { this.loading = false; },
    });
  }

  pick(id: string): void { this.router.navigate(['/drift', id]); }
  clear(): void { this.router.navigate(['/drift']); }

  toggleCompare(): void { this.compareMode = !this.compareMode; }

  selectedPersona(): Persona | undefined {
    return this.personas.find(p => p._id === this.selectedPersonaId);
  }

  diffLines(): DiffLine[] {
    if (!this.leftVersion || !this.rightVersion) return [];
    const L = this.leftVersion.snapshot, R = this.rightVersion.snapshot;
    const lines: DiffLine[] = [];

    if (L.moodTag !== R.moodTag) {
      lines.push({ kind: 'rm', text: `Mood: ${L.moodTag || '—'}` });
      lines.push({ kind: 'add', text: `Mood: ${R.moodTag || '—'}` });
    } else {
      lines.push({ kind: 'same', text: `Mood: ${L.moodTag || '—'}` });
    }
    if (L.connectionGoal !== R.connectionGoal) {
      lines.push({ kind: 'rm', text: `Goal: ${L.connectionGoal}` });
      lines.push({ kind: 'add', text: `Goal: ${R.connectionGoal}` });
    } else {
      lines.push({ kind: 'same', text: `Goal: ${L.connectionGoal}` });
    }

    const lTraits = new Set((L.traits || []).map(t => t.toLowerCase()));
    const rTraits = new Set((R.traits || []).map(t => t.toLowerCase()));
    for (const t of L.traits || []) {
      if (!rTraits.has(t.toLowerCase())) lines.push({ kind: 'rm', text: `· ${t}` });
    }
    for (const t of R.traits || []) {
      if (!lTraits.has(t.toLowerCase())) lines.push({ kind: 'add', text: `· ${t}` });
    }
    for (const t of L.traits || []) {
      if (rTraits.has(t.toLowerCase())) lines.push({ kind: 'same', text: `· ${t}` });
    }
    return lines;
  }

  versionKind(v: PersonaVersion, prev: PersonaVersion | undefined): 'add' | 'chg' | 'rm' {
    if (!prev) return 'add';
    const L = prev.snapshot, R = v.snapshot;
    if ((L.traits || []).length < (R.traits || []).length) return 'add';
    if ((L.traits || []).length > (R.traits || []).length) return 'rm';
    return 'chg';
  }

  versionSummary(v: PersonaVersion, prev: PersonaVersion | undefined): string {
    if (!prev) return `Initial version created`;
    const L = prev.snapshot, R = v.snapshot;
    const changes: string[] = [];
    if (L.moodTag !== R.moodTag) changes.push(`mood ${L.moodTag || '—'} → ${R.moodTag || '—'}`);
    if (L.connectionGoal !== R.connectionGoal) changes.push(`goal ${L.connectionGoal} → ${R.connectionGoal}`);
    const lTraits = new Set((L.traits || []).map(t => t.toLowerCase()));
    const rTraits = new Set((R.traits || []).map(t => t.toLowerCase()));
    const added = (R.traits || []).filter(t => !lTraits.has(t.toLowerCase()));
    const removed = (L.traits || []).filter(t => !rTraits.has(t.toLowerCase()));
    if (added.length) changes.push(`+ ${added.join(', ')}`);
    if (removed.length) changes.push(`− ${removed.join(', ')}`);
    return changes.length ? changes.join(' · ') : 'Saved — no detectable field change';
  }

  prevOf(i: number): PersonaVersion | undefined {
    return this.versions[i + 1]; // list is sorted newest → oldest
  }
}
