import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { Subscription, combineLatest } from 'rxjs';
import { PersonaService } from '../../services/persona.service';
import { MatchService } from '../../services/match.service';
import { Persona } from '../../models/persona.model';
import { Match } from '../../models/match.model';
import { IconComponent } from '../../shared/icon.component';
import { ReportPanelComponent } from '../report-panel/report-panel.component';
import { hueOf, initialOf } from '../../shared/persona-helpers';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  hue: number;
  initial: string;
}
interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  matchId: string;
  weight: number;
}

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, IconComponent, ReportPanelComponent],
  templateUrl: './graph.component.html',
})
export class GraphComponent implements OnInit, OnDestroy {
  @ViewChild('svgRoot', { static: true }) svgRoot!: ElementRef<SVGSVGElement>;

  private subs: Subscription[] = [];
  private personas: Persona[] = [];
  private matches: Match[] = [];

  focused: SimNode | null = null;
  focusedMatches: Array<{ match: Match; other: SimNode }> = [];
  drawerMatch: Match | null = null;
  drawerA: Persona | null = null;
  drawerB: Persona | null = null;

  nodeCount = 0;
  edgeCount = 0;
  strongCount = 0;

  constructor(
    private personaService: PersonaService,
    private matchService: MatchService,
  ) {}

  ngOnInit(): void {
    this.personaService.load().subscribe();
    this.matchService.load().subscribe();
    this.subs.push(
      combineLatest([this.personaService.personas$, this.matchService.matches$]).subscribe(([p, m]) => {
        this.personas = p;
        this.matches = m;
        this.nodeCount = p.length;
        this.edgeCount = m.length;
        this.strongCount = m.filter(x => x.score >= 80).length;
        this.render();
      }),
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private render(): void {
    const svg = d3.select(this.svgRoot.nativeElement);
    svg.selectAll('*').remove();
    if (!this.matches.length) return;

    const width = 1000, height = 720;
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    // build nodes from everyone referenced by matches
    const nodeMap = new Map<string, SimNode>();
    for (const m of this.matches) {
      for (const side of ['personaAId', 'personaBId'] as const) {
        const v = m[side];
        if (typeof v === 'string') continue;
        if (!v._id) continue;
        if (!nodeMap.has(v._id)) {
          nodeMap.set(v._id, {
            id: v._id,
            name: v.name,
            hue: hueOf(v),
            initial: initialOf(v),
          });
        }
      }
    }
    const nodes = Array.from(nodeMap.values());
    const ownIds = new Set(this.personas.map(p => p._id).filter(Boolean) as string[]);

    const edges: SimEdge[] = this.matches.map(m => ({
      source: (typeof m.personaAId === 'string' ? m.personaAId : m.personaAId._id!),
      target: (typeof m.personaBId === 'string' ? m.personaBId : m.personaBId._id!),
      matchId: m._id,
      weight: m.score,
    }));

    // defs
    const defs = svg.append('defs');
    const grad = defs.append('radialGradient').attr('id', 'bgglow').attr('cx', '50%').attr('cy', '50%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent)').attr('stop-opacity', '0.12');
    grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent)').attr('stop-opacity', '0');

    // background glow + concentric rings
    svg.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 300).attr('fill', 'url(#bgglow)');
    for (const r of [120, 200, 280]) {
      svg.append('circle')
        .attr('cx', width / 2).attr('cy', height / 2).attr('r', r)
        .attr('fill', 'none').attr('stroke', 'var(--border)')
        .attr('stroke-dasharray', '2 6').attr('opacity', 0.6);
    }

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimEdge>(edges).id(d => d.id).distance(e => 220 - (e.weight / 100) * 120))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(36));

    const linkGroup = svg.append('g');
    const link = linkGroup.selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-opacity', d => 0.2 + (d.weight / 100) * 0.5)
      .attr('stroke-width', d => 0.5 + (d.weight / 100) * 3)
      .style('cursor', 'pointer')
      .on('click', (_, e) => this.openEdgeReport(e));

    const nodeGroup = svg.append('g');
    const node = nodeGroup.selectAll('g.gn')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'graph-node gn')
      .style('cursor', 'pointer')
      .on('click', (_, n) => this.focusNode(n, nodes, edges));

    node.append('circle')
      .attr('r', d => ownIds.has(d.id) ? 28 : 20)
      .attr('fill', d => `hsl(${d.hue} 80% 62%)`)
      .attr('stroke', d => ownIds.has(d.id) ? `hsl(${d.hue} 90% 80%)` : 'var(--accent-2)')
      .attr('stroke-width', 1.5);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-family', 'Fraunces, serif')
      .attr('font-weight', 500)
      .attr('font-size', d => ownIds.has(d.id) ? 18 : 13)
      .attr('fill', 'white')
      .text(d => d.initial);

    node.append('title').text(d => d.name);

    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);
      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  private openEdgeReport(edge: SimEdge): void {
    const m = this.matches.find(x => x._id === edge.matchId);
    if (!m) return;
    this.drawerMatch = m;
    this.drawerA = typeof m.personaAId === 'string' ? null : m.personaAId;
    this.drawerB = typeof m.personaBId === 'string' ? null : m.personaBId;
  }

  closeDrawer(): void { this.drawerMatch = null; }

  private focusNode(n: SimNode, nodes: SimNode[], edges: SimEdge[]): void {
    if (this.focused?.id === n.id) { this.focused = null; this.focusedMatches = []; return; }
    this.focused = n;
    this.focusedMatches = edges
      .filter(e => (e.source as SimNode).id === n.id || (e.target as SimNode).id === n.id)
      .sort((a, b) => b.weight - a.weight)
      .map(e => {
        const otherId = (e.source as SimNode).id === n.id ? (e.target as SimNode).id : (e.source as SimNode).id;
        const other = nodes.find(x => x.id === otherId)!;
        const match = this.matches.find(x => x._id === e.matchId)!;
        return { match, other };
      });
  }

  clearFocus(): void { this.focused = null; this.focusedMatches = []; }

  openFocusMatch(match: Match): void { this.openEdgeReport({ matchId: match._id } as SimEdge); }
}
