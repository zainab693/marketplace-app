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
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: 'store.page.html',
  styleUrls: ['store.page.scss'],
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
export default class StorePage {
  private ps = inject(ProductService);
  private route = inject(ActivatedRoute);
  storeId = 's1';
  items: any[] = [];

  ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || 's1';
    this.load();
  }

  load() {
    this.ps
      .list({ storeId: this.storeId })
      .subscribe((res) => (this.items = res));
  }

  delete(id: string) {
    if (!confirm('Delete this product?')) return;
    this.ps.remove(id).subscribe(() => this.load());
  }
}
