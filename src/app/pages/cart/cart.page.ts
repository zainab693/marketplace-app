import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonButtons,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

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
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonButtons,
  ],
})
export default class CartPage {
  cart = inject(CartService);

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
