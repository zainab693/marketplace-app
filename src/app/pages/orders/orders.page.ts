import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  templateUrl: 'orders.page.html',
  styleUrls: ['orders.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
  ],
})
export default class OrdersPage {
  private orders = inject(OrderService);
  items: any[] = [];

  ngOnInit() {
    this.orders.list().subscribe((res) => (this.items = res));
  }
}
