import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match } from '../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  matches$ = this.matchesSubject.asObservable();

  topMatches$: Observable<Match[]> = this.matches$.pipe(
    map(list => [...list].sort((a, b) => b.score - a.score).slice(0, 10))
  );

  constructor(private http: HttpClient) {}

  load(): Observable<Match[]> {
    return this.http.get<Match[]>(`${environment.apiUrl}/matches`)
      .pipe(tap(list => this.matchesSubject.next(list)));
  }

  rescoreAll(): Observable<{ ok: boolean; rescored: number }> {
    return this.http.post<{ ok: boolean; rescored: number }>(`${environment.apiUrl}/matches/score`, {});
  }

  getReport(matchId: string): Observable<{ report: string }> {
    return this.http.get<{ report: string }>(`${environment.apiUrl}/matches/${matchId}/report`);
  }
}
