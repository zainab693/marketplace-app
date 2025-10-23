import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton
} from '@ionic/angular/standalone';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton, CurrencyPipe]
})
export class ProductCardComponent {
  @Input() product: any;
  @Output() add = new EventEmitter<void>();
}