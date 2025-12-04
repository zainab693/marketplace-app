import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: 'checkout.page.html',
  styleUrls: ['checkout.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    RouterModule,
  ],
})
export default class CheckoutPage {
  cart = inject(CartService);
  orders = inject(OrderService);
  router = inject(Router);

  name = '';
  phone = '';
  pickupTime = '';

  placeOrder() {
    if (!this.cart.items.length) return;

    const payload = {
      customerName: this.name,
      phone: this.phone,
      pickupTime: this.pickupTime,
      items: this.cart.items.map((i) => ({
        productId: i.productId,
        title: i.title,
        price: i.price,
        qty: i.qty,
      })),
      total: this.cart.total,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
    };

    this.orders.create(payload).subscribe((created: any) => {
      this.cart.clear();
      this.router.navigate(['/orders']); // go to order history
    });
  }
}
