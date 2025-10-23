import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  items$ = this._items$.asObservable();

  get items() {
    return this._items$.value;
  }
  get count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  }
  get total() {
    return this.items.reduce((s, i) => s + i.qty * (i.price ?? 0), 0);
  }

  add(item: CartItem) {
    const idx = this.items.findIndex((i) => i.productId === item.productId);
    const next = [...this.items];
    if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
    else next.push(item);
    this._items$.next(next);
  }

  updateQty(productId: string, qty: number) {
    if (qty <= 0) return this.remove(productId);
    const next = this.items.map((i) =>
      i.productId === productId ? { ...i, qty } : i
    );
    this._items$.next(next);
  }

  remove(productId: string) {
    const next = this.items.filter((i) => i.productId !== productId);
    this._items$.next(next);
  }

  clear() {
    this._items$.next([]);
  }
}
