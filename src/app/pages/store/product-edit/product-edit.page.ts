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
  selector: 'app-product-edit',
  standalone: true,
  templateUrl: 'product-edit.page.html',
  styleUrls: ['product-edit.page.scss'],
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
export default class ProductEditPage {
  fb = inject(FormBuilder);
  ps = inject(ProductService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  storeId = 's1';
  id = '';
  form = this.fb.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['INR'],
    description: [''],
  });

  ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || 's1';
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.ps.get(this.id).subscribe((p) => this.form.patchValue(p));
  }

  save() {
    this.ps
      .update(this.id, this.form.value)
      .subscribe(() => this.router.navigate(['/store', this.storeId]));
  }
}
