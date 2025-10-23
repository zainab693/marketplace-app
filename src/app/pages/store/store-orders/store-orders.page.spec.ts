import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreOrdersPage } from './store-orders.page';

describe('StoreOrdersPage', () => {
  let component: StoreOrdersPage;
  let fixture: ComponentFixture<StoreOrdersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
