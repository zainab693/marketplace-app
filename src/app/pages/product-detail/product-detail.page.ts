import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonSpinner,
    IonBadge,
    RouterModule,
  ],
})
export default class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ps = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastController);
  private sub?: Subscription;

  loading = true;
  product: any;
  images: string[] = [];
  activeImage = '';
  qty = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(id);
      this.sub = this.cart.items$.subscribe(() => this.syncQty());
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  fetchProduct(id: string) {
    this.loading = true;
    this.ps.get(id).subscribe({
      next: (p) => {
        this.product = p;
        this.images = this.normalizeImages(p);
        this.activeImage = this.images[0];
        this.loading = false;
        this.syncQty();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  normalizeImages(p: any): string[] {
    const out: string[] = [];
    if (Array.isArray(p?.images)) {
      out.push(...p.images.filter(Boolean));
    } else if (typeof p?.images === 'string') {
      try {
        const parsed = JSON.parse(p.images);
        if (Array.isArray(parsed)) out.push(...parsed);
      } catch {
        if (p.images.startsWith('http')) out.push(p.images);
      }
    }
    if (!out.length) {
      const seed = (p?.id || p?.title || 'product').toString().replace(/\s+/g, '_');
      out.push(`https://picsum.photos/seed/${encodeURIComponent(seed)}/900/700`);
    }
    return out;
  }

  setActiveImage(src: string) {
    this.activeImage = src;
  }

  addToCart() {
    if (!this.product) return;
    const qty = this.cart.add({
      productId: this.product.id,
      title: this.product.title,
      price: this.product.price ?? 0,
      image: this.images?.[0],
      qty: 1,
    });
    this.toast.create({
      message: `Added "${this.product.title}" · In cart: ${qty}`,
      duration: 1400,
      position: 'bottom',
    }).then(t => t.present());
    this.qty = qty;
  }

  decFromCart() {
    if (!this.product) return;
    const current = this.cart.getQty(this.product.id);
    const next = current - 1;
    if (next <= 0) {
      this.cart.remove(this.product.id);
    } else {
      this.cart.updateQty(this.product.id, next);
    }
    this.qty = this.cart.getQty(this.product.id);
  }

  private syncQty() {
    if (!this.product) return;
    this.qty = this.cart.getQty(this.product.id);
  }
}
