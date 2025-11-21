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
  private _items$ = new BehaviorSubject<CartItem[]>(this.restore());
  items$ = this._items$.asObservable();

  private restore(): CartItem[] {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  private persist(items: CartItem[]) {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }

  get items() { return this._items$.value; }
  get count() { return this.items.reduce((s, i) => s + i.qty, 0); }
  get total() { return this.items.reduce((s, i) => s + i.qty * (i.price ?? 0), 0); }

  private set(next: CartItem[]) {
    this._items$.next(next);
    this.persist(next);
  }

  add(item: CartItem) {
    const idx = this.items.findIndex(i => i.productId === item.productId);
    const next = [...this.items];
    if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
    else next.push(item);
    this.set(next);
  }
  updateQty(productId: string, qty: number) {
    if (qty <= 0) return this.remove(productId);
    const next = this.items.map(i => i.productId === productId ? { ...i, qty } : i);
    this.set(next);
  }
  remove(productId: string) { this.set(this.items.filter(i => i.productId !== productId)); }
  clear() { this.set([]); }
}