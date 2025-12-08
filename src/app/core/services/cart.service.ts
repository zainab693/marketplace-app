import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  items$ = this._items$.asObservable();

  // track which user id the current items belong to
  private _currentUserId: string | undefined;

  constructor(private auth: AuthService) {
    // wait for auth restore, then load the cart for the restored user
    this.auth.ready().then(() => {
      this._currentUserId = this.auth.user?.id;
      // migrate any legacy 'cart_items' key into the new per-user scheme
      const legacy = localStorage.getItem('cart_items');
      if (legacy) {
        try {
          localStorage.setItem(this.keyFor(this._currentUserId), legacy);
          localStorage.removeItem('cart_items');
        } catch { /* ignore */ }
      }

      const loaded = this.loadFromStorage(this._currentUserId);
      this._items$.next(loaded);

      // now listen for user changes and handle swapping/persisting carts
      this.auth.user$.subscribe((user) => {
        // persist current items to the key for the user we're leaving
        // (this ensures the user's cart is saved across logout/login)
        this.persistToKey(this.items, this._currentUserId);

        // set current user id and load their cart
        this._currentUserId = user?.id;
        const next = this.loadFromStorage(this._currentUserId);
        this._items$.next(next);
      });
    });
  }

  private keyFor(userId?: string) {
    return userId ? `cart_items_${userId}` : 'cart_items_guest';
  }

  private loadFromStorage(userId?: string): CartItem[] {
    try {
      const raw = localStorage.getItem(this.keyFor(userId));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private persistToKey(items: CartItem[], userId?: string) {
    try {
      localStorage.setItem(this.keyFor(userId), JSON.stringify(items));
    } catch { /* ignore */ }
  }

  private persist(items: CartItem[]) {
    this.persistToKey(items, this._currentUserId);
  }

  get items() { return this._items$.value; }
  get count() { return this.items.reduce((s, i) => s + i.qty, 0); }
  get total() { return this.items.reduce((s, i) => s + i.qty * (i.price ?? 0), 0); }
  getQty(productId: string) {
    return this.items.find(i => i.productId === productId)?.qty ?? 0;
  }

  private set(next: CartItem[]) {
    this._items$.next(next);
    this.persist(next);
  }

  add(item: CartItem): number {
    const idx = this.items.findIndex(i => i.productId === item.productId);
    const next = [...this.items];
    let newQty = item.qty;
    if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + item.qty, image: item.image ?? next[idx].image };
    else next.push(item);
    newQty = next.find(i => i.productId === item.productId)?.qty ?? item.qty;
    this.set(next);
    return newQty;
  }
  updateQty(productId: string, qty: number) {
    if (qty <= 0) return this.remove(productId);
    const next = this.items.map(i => i.productId === productId ? { ...i, qty } : i);
    this.set(next);
  }
  remove(productId: string) { this.set(this.items.filter(i => i.productId !== productId)); }
  clear() { this.set([]); }

  setImage(productId: string, image: string) {
    const next = this.items.map(i => i.productId === productId ? { ...i, image } : i);
    this.set(next);
  }
}
