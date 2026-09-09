import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Quote {
  id: number;
  source_name: string;
  quote_text: string;
  speaker_1?: string;
  speaker_2?: string;
  speaker_3?: string;
  notes?: string;
  contributor?: string;
  tags: string[];
  image_url?: string;
  next_up?: boolean;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteFilters {
  sort?: string;
  order?: 'asc' | 'desc';
  source?: string;
  speaker?: string;
  tag?: string;
  unused?: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/quotes';

  getImageUrl(quoteOrUrl?: Quote | null | string): string {
    if (!quoteOrUrl) return '/images/thumbs/default.jpg';
    const url = typeof quoteOrUrl === 'string' ? quoteOrUrl : quoteOrUrl.image_url;
    if (!url) return '/images/thumbs/default.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads')) {
      const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
      return `${apiBase}${url}`;
    }
    if (url.startsWith('/')) {
      return url;
    }
    return `/images/thumbs/${url}`;
  }

  getQuotes(filters?: QuoteFilters): Observable<Quote[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.sort) params = params.set('sort', filters.sort);
      if (filters.order) params = params.set('order', filters.order);
      if (filters.source) params = params.set('source', filters.source);
      if (filters.speaker) params = params.set('speaker', filters.speaker);
      if (filters.tag) params = params.set('tag', filters.tag);
      if (filters.unused) params = params.set('unused', 'true');
    }
    return this.http.get<Quote[]>(this.baseUrl, { params });
  }

  getRandomQuote(): Observable<Quote> {
    return this.http.get<Quote>(`${this.baseUrl}/random`);
  }

  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/tags`);
  }

  getSources(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/sources`);
  }

  addQuote(quote: Partial<Quote> | FormData, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.post<Quote>(this.baseUrl, quote, { headers });
  }

  markAsUsed(id: number, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.patch<Quote>(`${this.baseUrl}/${id}/used`, {}, { headers });
  }

  markAsUnused(id: number, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.patch<Quote>(`${this.baseUrl}/${id}/unuse`, {}, { headers });
  }

  toggleNextUp(id: number, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.patch<Quote>(`${this.baseUrl}/${id}/nextup`, {}, { headers });
  }

  deleteQuote(id: number, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }

  updateQuote(id: number, quote: Partial<Quote> | FormData, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.patch<Quote>(`${this.baseUrl}/${id}`, quote, { headers });
  }

  restoreQuote(id: number, password: string): Observable<Quote> {
    const headers = new HttpHeaders({ 'x-app-password': password });
    return this.http.patch<Quote>(`${this.baseUrl}/${id}/restore`, {}, { headers });
  }

  getBackupDownloadUrl(): string {
    return `${this.baseUrl}/backup/download`;
  }
}
