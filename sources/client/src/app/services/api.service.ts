import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManufacturersResponse, ProductsResponse } from '../models/api.models';

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
