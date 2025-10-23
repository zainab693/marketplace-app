import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-new',
  standalone: true,
  templateUrl: 'product-new.page.html',
  styleUrls: ['product-new.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
  ],
})
export default class ProductNewPage {
  fb = inject(FormBuilder);
  ps = inject(ProductService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  storeId = 's1';
  form = this.fb.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    currency: ['USD'],
  });

  ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || 's1';
  }

  save() {
    const dto = { ...this.form.value, storeId: this.storeId };
    this.ps
      .create(dto)
      .subscribe(() => this.router.navigate(['/store', this.storeId]));
  }
}
