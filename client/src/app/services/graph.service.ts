import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { PersonaService } from './persona.service';
import { MatchService } from './match.service';
import { Persona } from '../models/persona.model';
import { Match } from '../models/match.model';

export interface GraphNode {
  id: string;
  name: string;
  group?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  matchId: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Injectable({ providedIn: 'root' })
export class GraphService {
  constructor(private personas: PersonaService, private matches: MatchService) {}

  graph$: Observable<GraphData> = combineLatest([
    this.personas.personas$,
    this.matches.matches$,
  ]).pipe(
    map(([personas, matches]) => this.buildGraph(personas, matches))
  );

  private buildGraph(personas: Persona[], matches: Match[]): GraphData {
    const nodeMap = new Map<string, GraphNode>();
    for (const p of personas) {
      if (p._id) nodeMap.set(p._id, { id: p._id, name: p.name, group: p.connectionGoal });
    }
    for (const m of matches) {
      const a = typeof m.personaAId === 'string' ? m.personaAId : m.personaAId._id!;
      const b = typeof m.personaBId === 'string' ? m.personaBId : m.personaBId._id!;
      if (!nodeMap.has(a) && typeof m.personaAId !== 'string') {
        const p = m.personaAId;
        nodeMap.set(a, { id: a, name: p.name, group: p.connectionGoal });
      }
      if (!nodeMap.has(b) && typeof m.personaBId !== 'string') {
        const p = m.personaBId;
        nodeMap.set(b, { id: b, name: p.name, group: p.connectionGoal });
      }
    }
    const edges: GraphEdge[] = matches.map(m => ({
      source: typeof m.personaAId === 'string' ? m.personaAId : m.personaAId._id!,
      target: typeof m.personaBId === 'string' ? m.personaBId : m.personaBId._id!,
      weight: m.score,
      matchId: m._id,
    }));
    return { nodes: Array.from(nodeMap.values()), edges };
  }
}
