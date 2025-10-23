import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  create(dto: any) {
    return this.http.post(`${environment.apiBaseUrl}/orders`, dto);
  }

  list() {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}/orders?_sort=createdAt&_order=desc`
    );
  }

  get(id: string) {
    return this.http.get<any>(`${environment.apiBaseUrl}/orders/${id}`);
  }
}
