import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  list(params: any = {}) {
    // Normalize filters so both the mock json-server and real API understand them
    const normalized: Record<string, string> = {};
    const addParam = (key: string, value: any) => {
      const invalidNumber = typeof value === 'number' && Number.isNaN(value);
      if (value === undefined || value === null || value === '' || invalidNumber) return;
      normalized[key] = String(value);
    };

    const q = typeof params.q === 'string' ? params.q.trim() : params.q;
    const quick = params.quick as string | undefined;
    const sort = params.sort as string | undefined;

    addParam('q', q);
    addParam('category', params.category);
    addParam('storeId', params.storeId);
    if (q) {
      // json-server friendly matching on title/description; Prisma API will ignore extras
      addParam('title_like', q);
      addParam('description_like', q);
    }

    const parsedMin = params.minPrice !== undefined && params.minPrice !== null ? Number(params.minPrice) : undefined;
    const parsedMax = params.maxPrice !== undefined && params.maxPrice !== null ? Number(params.maxPrice) : undefined;
    let priceGte = parsedMin;
    let priceLte = parsedMax;

    if (quick === 'budget') priceLte = Math.min(priceLte ?? Infinity, 20);
    if (quick === 'premium') priceGte = Math.max(priceGte ?? 0, 50);

    // Keep original keys for the Prisma API, and json-server friendly versions alongside
    addParam('minPrice', parsedMin);
    addParam('maxPrice', parsedMax);
    if (priceGte !== undefined) addParam('price_gte', priceGte);
    if (priceLte !== undefined && priceLte !== Infinity) addParam('price_lte', priceLte);

    let sortSpec: { sort?: string; order?: string } = { sort: 'createdAt', order: 'desc' };
    if (quick === 'trending') {
      sortSpec = { sort: 'createdAt,price', order: 'desc,desc' };
      addParam('_limit', 20);
    } else if (quick === 'recent') {
      sortSpec = { sort: 'createdAt', order: 'desc' };
    }

    const sortMap: Record<string, { sort: string; order: string }> = {
      priceAsc: { sort: 'price', order: 'asc' },
      priceDesc: { sort: 'price', order: 'desc' },
      name: { sort: 'title', order: 'asc' },
      relevance: { sort: 'createdAt', order: 'desc' },
    };
    if (sort && sortMap[sort]) {
      sortSpec = sortMap[sort];
    }

    addParam('sort', sort);
    addParam('quick', quick);
    addParam('_sort', sortSpec.sort);
    addParam('_order', sortSpec.order);

    const httpParams = new HttpParams({ fromObject: normalized });
    return this.http.get<any[]>(`${environment.apiBaseUrl}/products`, { params: httpParams });
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
