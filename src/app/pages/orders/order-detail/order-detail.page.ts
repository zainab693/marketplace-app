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
  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  templateUrl: 'order-detail.page.html',
  styleUrls: ['order-detail.page.scss'],
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
    IonButtons,
  ],
})
export default class OrderDetailPage {
  private route = inject(ActivatedRoute);
  private orders = inject(OrderService);
  order: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orderId')!;
    this.orders.get(id).subscribe((o) => (this.order = o));
  }
}
