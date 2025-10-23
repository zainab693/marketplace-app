import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  list(params: any = {}) {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any[]>(`${environment.apiBaseUrl}/products`, {
      params: httpParams,
    });
  }

  get(id: string) {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/${id}`);
  }

  create(dto: any) {
    return this.http.post(`${environment.apiBaseUrl}/products`, dto);
  }

  update(id: string, dto: any) {
    return this.http.patch(`${environment.apiBaseUrl}/products/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/products/${id}`);
  }
}
