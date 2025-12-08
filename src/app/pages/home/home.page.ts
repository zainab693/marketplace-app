import { Component, OnInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton, 
  IonSearchbar, 
  IonBadge,
  IonInput,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { ProductService } from '../../core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'name';
type QuickKey = 'none' | 'trending' | 'budget' | 'premium' | 'recent';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterModule,
    IonLabel,
    IonItem,
    IonList,
    IonButton,
    IonSearchbar,
    IonBadge,
    IonInput,
    IonSkeletonText,
    ProductCardComponent
  ],
})
export class HomePage implements OnInit {
  private host = inject(ElementRef);
  private _outsideClickHandler: any;
  private ps = inject(ProductService);
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  loading = true;
  /** Visible runtime build tag for debugging cached builds */
  buildTag = new Date().toISOString();

  filtered: any[] = [];
  query = '';
  categories: string[] = [];
  category = 'All';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  quickFilter: QuickKey = 'none';
  quickFilters: { value: QuickKey; label: string; description: string }[] = [
    { value: 'none', label: 'All products', description: 'Browse everything' },
    { value: 'trending', label: 'Trending', description: 'Hot right now' },
    { value: 'budget', label: 'Budget picks', description: 'Under $20' },
    { value: 'premium', label: 'Premium', description: 'Top shelf finds' },
    { value: 'recent', label: 'New arrivals', description: 'Latest products' },
  ];

  // Sort panel state
  showSortPanel = false;
  tempSort: SortKey = 'relevance';
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'priceAsc', label: 'Price ↑' },
    { value: 'priceDesc', label: 'Price ↓' },
    { value: 'name', label: 'Name' },
  ];

  ngOnInit() {
    this.loadProducts(true);

    // outside click handler to close the sort panel
    this._outsideClickHandler = (ev: MouseEvent) => {
      if (this.showSortPanel && this.host && this.host.nativeElement && !this.host.nativeElement.contains(ev.target)) {
        this.showSortPanel = false;
      }
    };
    window.addEventListener('click', this._outsideClickHandler);
  }

  ngOnDestroy(): void {
    if (this._outsideClickHandler) window.removeEventListener('click', this._outsideClickHandler);
  }

  sortBy: SortKey = 'relevance';

  private loadProducts(initial = false) {
    const showSkeleton = initial;
    const params: any = {
      q: this.query?.trim() || undefined,
      category: this.category !== 'All' ? this.category : undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      sort: this.sortBy,
      quick: this.quickFilter !== 'none' ? this.quickFilter : undefined,
    };

    if (showSkeleton) this.loading = true;
    this.ps.list(params).subscribe({
      next: (items) => {
        const term = (params.q ?? '').toString().toLowerCase();
        const locallyFiltered = term
          ? items.filter(i =>
              (i.title ?? '').toLowerCase().includes(term) ||
              (i.description ?? '').toLowerCase().includes(term)
            )
          : items;
        this.filtered = locallyFiltered;
        if (initial && !this.categories.length) {
          const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
          this.categories = ['All', ...cats];
        }
        if (showSkeleton) this.loading = false;
      },
      error: () => {
        if (showSkeleton) this.loading = false;
      },
    });
  }

  search() {
    this.loadProducts(false);
  }

  onSearchChange(val: string) {
    this.query = val ?? '';
    this.search();
  }

  onQuickSelect(val: QuickKey) {
    this.quickFilter = val;
    this.search();
  }

  async openProduct(p: any) {
    await this.router.navigate(['/products', p.id]);
  }

  async addToCart(p: any) {
    const qty = this.cart.add({
      productId: p.id,
      title: p.title,
      price: p.price ?? 0,
      qty: 1,
      image: this.primaryImage(p),
    });
    await this.showAddToast(p.title, qty);
    this.pulseCartBadge();
  }

  decFromCart(p: any) {
    const current = this.cart.getQty(p.id);
    const next = current - 1;
    if (next <= 0) {
      this.cart.remove(p.id);
    } else {
      this.cart.updateQty(p.id, next);
    }
  }

  incFromCart(p: any) {
    this.addToCart(p);
  }

  getQty(id: string) {
    return this.cart.getQty(id);
  }

  primaryImage(p: any) {
    const img = Array.isArray(p?.images) ? p.images[0] : (typeof p?.images === 'string' ? (() => {
      try { const parsed = JSON.parse(p.images); return parsed?.[0]; } catch { return p.images; }
    })() : null);
    return img || '';
  }

  private async showAddToast(title: string, qty: number) {
    const t = await this.toastCtrl.create({ message: `Added "${title}" · In cart: ${qty}`, duration: 1400 });
    t.present();
  }

  private pulseCartBadge() {
    try {
      const badge = document.querySelector('ion-badge.cart-badge') as HTMLElement | null;
      if (badge) {
        badge.classList.remove('badge-pulse');
        void badge.offsetWidth;
        badge.classList.add('badge-pulse');
        setTimeout(() => badge.classList.remove('badge-pulse'), 700);
      }
    } catch (e) {
      // ignore
    }
  }

  onSortChange(ev: any) {
    console.log('[HomePage] onSortChange event:', ev, 'sortBy:', this.sortBy);
    this.search();
  }

  onChipClick(c: string) {
    console.log('[HomePage] onChipClick:', c);
  }

  setSort(value: SortKey) {
    this.sortBy = value;
    this.search();
  }

  toggleSortPanel() {
    this.showSortPanel = !this.showSortPanel;
    if (this.showSortPanel) {
      this.tempSort = this.sortBy;
    }
  }

  applySort() {
    this.sortBy = this.tempSort;
    this.search();
    this.showSortPanel = false;
  }

  cancelSort() {
    this.tempSort = this.sortBy;
    this.showSortPanel = false;
  }

  getSortLabel() {
    const opt = this.sortOptions.find(o => o.value === this.sortBy);
    return opt ? opt.label : 'Sort';
  }

  getQuickLabel() {
    const opt = this.quickFilters.find(q => q.value === this.quickFilter);
    return opt ? opt.label : 'All products';
  }
}
