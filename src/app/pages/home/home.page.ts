import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton, 
  IonSearchbar, 
  IonBadge,
  IonButtons
} from '@ionic/angular/standalone';
import {ProductService} from '../../core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
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
    IonButtons,
  ],
})
export class HomePage implements OnInit {
  private ps = inject(ProductService);
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);

  products: any[] = [];
  filtered: any[] = [];
  query = '';

  ngOnInit() {
    this.ps.list().subscribe((items) => {
      this.products = items;
      this.filtered = items;
    });
  }

  search() {
    const q = this.query.toLowerCase();
    this.filtered = this.products.filter((p) =>
      p.title.toLowerCase().includes(q)
    );
  }

  addToCart(p: any) {
    this.cart.add({
      productId: p.id,
      title: p.title,
      price: p.price ?? 0,
      qty: 1,
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
