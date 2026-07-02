import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ManufacturersResponse,
  ProductSearchResponse,
  ProductsResponse,
  SemanticSearchResponse,
} from '../models/api.models';

/**
 * Talks to the ExportWise API. All URLs are relative to `/api`, which the Angular
 * dev proxy forwards to the NestJS server (see proxy.conf.json) — so no CORS in dev.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  /** List of manufacturers with product counts — helps discover valid ids. */
  getManufacturers(): Observable<ManufacturersResponse> {
    return this.http.get<ManufacturersResponse>(`${this.base}/manufacturers`);
  }

  /** Exact (SQL) search: free-text over product name / category / manufacturer name. */
  searchProducts(query: string): Observable<ProductSearchResponse> {
    const params = new HttpParams().set('q', query.trim());
    return this.http.get<ProductSearchResponse>(`${this.base}/products/search`, { params });
  }

  /**
   * Smart (semantic) search: embeds the free-text query on the backend and returns
   * the most similar historical committee decisions with similarity scores.
   */
  semanticSearch(query: string, topK = 10): Observable<SemanticSearchResponse> {
    const params = new HttpParams().set('q', query.trim()).set('topK', String(topK));
    return this.http.get<SemanticSearchResponse>(`${this.base}/ai/search`, { params });
  }

  /**
   * THE SINGLE SWAPPABLE SEAM.
   * Today: look up products by manufacturer id.
   * Later: replace the body with the vector-DB semantic search call
   * (keep the signature `(query: string) => Observable<ProductsResponse>`).
   */
  askForProducts(query: string): Observable<ProductsResponse> {
    const id = encodeURIComponent(query.trim());
    return this.http.get<ProductsResponse>(`${this.base}/manufacturers/${id}/products`);
  }
}
