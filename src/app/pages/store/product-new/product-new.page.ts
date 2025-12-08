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
  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
    IonButtons,
    RouterModule,
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
    images: [[] as string[]],
  });
  imageData: string | null = null;
  imageName: string | null = null;
  imagePreview: string | null = null;

  ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || 's1';
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = reader.result as string;
      this.imagePreview = this.imageData;
    };
    reader.readAsDataURL(file);
  }

  save() {
    const dto: any = { ...this.form.value, storeId: this.storeId };
    if (this.imageData && this.imageName) {
      dto.imageData = this.imageData;
      dto.imageName = this.imageName;
    }
    this.ps
      .create(dto)
      .subscribe(() => this.router.navigate(['/store', this.storeId]));
  }
}
