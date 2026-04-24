import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiReportResponse {
  report: string;
  cached: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private reportSubject = new Subject<AiReportResponse>();
  report$ = this.reportSubject.asObservable();

  constructor(private http: HttpClient) {}

  requestReport(matchId: string): Observable<AiReportResponse> {
    return this.http.post<AiReportResponse>(`${environment.apiUrl}/ai/report`, { matchId })
      .pipe(tap(res => this.reportSubject.next(res)));
  }
}
