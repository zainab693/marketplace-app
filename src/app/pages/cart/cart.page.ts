import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonImg,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: 'cart.page.html',
  styleUrls: ['cart.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonImg,
  ],
})
export default class CartPage {
  cart = inject(CartService);
  private ps = inject(ProductService);

  ngOnInit() {
    this.hydrateMissingImages();
  }

  private hydrateMissingImages() {
    const missing = this.cart.items.filter(i => !i.image);
    missing.forEach(i => {
      this.ps.get(i.productId).subscribe(p => {
        const img = this.primaryImage(p);
        if (img) this.cart.setImage(i.productId, img);
      });
    });
  }

  private primaryImage(p: any) {
    if (Array.isArray(p?.images)) return p.images[0];
    if (typeof p?.images === 'string') {
      try {
        const parsed = JSON.parse(p.images);
        if (Array.isArray(parsed)) return parsed[0];
      } catch { return p.images; }
      return p.images;
    }
    return null;
  }

  inc(pId: string, current: number) {
    this.cart.updateQty(pId, current + 1);
  }
  dec(pId: string, current: number) {
    this.cart.updateQty(pId, current - 1);
  }
  remove(pId: string) {
    this.cart.remove(pId);
  }
}
