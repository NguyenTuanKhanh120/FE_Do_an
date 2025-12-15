import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TagDetail } from '../models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5134/api/tags';

  getTags(search?: string): Observable<TagDetail[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<TagDetail[]>(this.apiUrl, { params });
  }

  getPopularTags(limit: number = 20): Observable<TagDetail[]> {
    return this.http.get<TagDetail[]>(`${this.apiUrl}/popular`, {
      params: { limit: limit.toString() }
    });
  }

  getTagById(id: number): Observable<TagDetail> {
    return this.http.get<TagDetail>(`${this.apiUrl}/${id}`);
  }
}

