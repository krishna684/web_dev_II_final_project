import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PersonaVersion } from '../models/persona.model';

@Injectable({ providedIn: 'root' })
export class DriftService {
  private versionsSubject = new BehaviorSubject<PersonaVersion[]>([]);
  versions$ = this.versionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadHistory(personaId: string): Observable<PersonaVersion[]> {
    return this.http.get<PersonaVersion[]>(`${environment.apiUrl}/personas/${personaId}/history`)
      .pipe(tap(list => this.versionsSubject.next(list)));
  }
}
