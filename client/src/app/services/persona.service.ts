import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Persona } from '../models/persona.model';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private personasSubject = new BehaviorSubject<Persona[]>([]);
  personas$ = this.personasSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${environment.apiUrl}/personas`)
      .pipe(tap(list => this.personasSubject.next(list)));
  }

  create(persona: Partial<Persona>): Observable<Persona> {
    return this.http.post<Persona>(`${environment.apiUrl}/personas`, persona)
      .pipe(tap(p => this.personasSubject.next([p, ...this.personasSubject.value])));
  }

  update(id: string, persona: Partial<Persona>): Observable<Persona> {
    return this.http.put<Persona>(`${environment.apiUrl}/personas/${id}`, persona)
      .pipe(tap(updated => {
        const next = this.personasSubject.value.map(p => p._id === id ? updated : p);
        this.personasSubject.next(next);
      }));
  }

  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/personas/${id}`)
      .pipe(tap(() => {
        this.personasSubject.next(this.personasSubject.value.filter(p => p._id !== id));
      }));
  }
}
