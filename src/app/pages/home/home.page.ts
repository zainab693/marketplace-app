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
  IonButtons,
  IonChip,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  ToastController,
  IonSkeletonText
} from '@ionic/angular/standalone';
import {ProductService} from '../../core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

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
    IonChip,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    ToastController,
    IonSkeletonText
  ],
})
export class HomePage implements OnInit {
  private ps = inject(ProductService);
  cart = inject(CartService);
  auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  loading = true;

  products: any[] = [];
  filtered: any[] = [];
  query = '';
  categories: string[] = [];
  category = 'All';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  ngOnInit() {
  this.ps.list().subscribe(items => {
    this.products = items;
    this.filtered = items;
    // derive unique categories
    const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    this.categories = ['All', ...cats];
    this.filtered = items;
  }, _ => this.loading = false);
}
  async addToCart(p: any) {
  this.cart.add({ productId: p.id, title: p.title, price: p.price ?? 0, qty: 1 });
  const t = await this.toastCtrl.create({ message: `Added "${p.title}"`, duration: 1200 });
  t.present();
}

  sortBy: 'relevance' | 'priceAsc' | 'priceDesc' | 'name' = 'relevance';

  search() {
  const q = this.query.toLowerCase();
  let list = this.products.filter(p => {
    const matchesText = p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    const matchesCat = this.category === 'All' || p.category === this.category;
    const price = p.price ?? 0;
    const matchesMin = this.minPrice == null || price >= this.minPrice;
    const matchesMax = this.maxPrice == null || price <= this.maxPrice;
    return matchesText && matchesCat && matchesMin && matchesMax;
  });

  // sort
  if (this.sortBy === 'priceAsc') list = list.slice().sort((a,b) => (a.price??0) - (b.price??0));
  if (this.sortBy === 'priceDesc') list = list.slice().sort((a,b) => (b.price??0) - (a.price??0));
  if (this.sortBy === 'name') list = list.slice().sort((a,b) => (a.title||'').localeCompare(b.title||''));

  this.filtered = list;
}

  // addToCart(p: any) {
  //   this.cart.add({
  //     productId: p.id,
  //     title: p.title,
  //     price: p.price ?? 0,
  //     qty: 1,
  //   });
  // }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
