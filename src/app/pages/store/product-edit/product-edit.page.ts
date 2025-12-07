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
    IonButtons,
    RouterModule,
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
    images: [[] as string[]],
  });
  imageData: string | null = null;
  imageName: string | null = null;
  imagePreview: string | null = null;
  currentImage: string | null = null;

  ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || 's1';
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.ps.get(this.id).subscribe((p) => {
      this.form.patchValue(p);
      const imgs = Array.isArray(p.images) ? p.images : (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();
      this.currentImage = imgs?.[0] || null;
    });
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
    const dto: any = this.form.value;
    if (this.imageData && this.imageName) {
      dto.imageData = this.imageData;
      dto.imageName = this.imageName;
    }
    this.ps
      .update(this.id, dto)
      .subscribe(() => this.router.navigate(['/store', this.storeId]));
  }
}
