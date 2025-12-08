import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonCard, IonCardContent, IonImg, IonButton } from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [CommonModule, IonCard, IonCardContent, IonImg, IonButton, CurrencyPipe]
})
export class ProductCardComponent {
  @Input() product: any;
  @Input() qty = 0;
  @Output() add = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();
  @Output() view = new EventEmitter<void>();

  imageLoaded = false;

  get imageSrc(): string {
    // Prefer first image if available; otherwise use a picsum placeholder seeded by id or title
    const img = this.product?.images?.[0];
    if (img && typeof img === 'string' && img.length) return img.startsWith('/') ? img : img;
    const seed = (this.product?.id || this.product?.title || 'placeholder').toString().replace(/\s+/g, '_');
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
  }

  onImgLoad() {
    this.imageLoaded = true;
  }

  onAddClicked(ev: Event) {
    ev.stopPropagation();
    const btn = ev.currentTarget as HTMLElement;
    // make sure we target the floating button element
    const floating = (btn.closest('.image-wrap')?.querySelector('.add-floating')) as HTMLElement | null;
    const targetBtn = floating ?? btn;
    if (targetBtn) {
      targetBtn.classList.remove('pulse');
      void targetBtn.offsetWidth;
      targetBtn.classList.add('pulse');
    }
    this.add.emit();
  }

  onDecClicked(ev: Event) {
    ev.stopPropagation();
    this.decrement.emit();
  }

  onView() {
    this.view.emit();
  }
}
