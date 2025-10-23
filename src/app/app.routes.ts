import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.default),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.default),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.default),
  },
  {
    path: 'store/:storeId',
    canActivate: [authGuard, roleGuard('vendor')],
    loadComponent: () =>
      import('./pages/store/store.page').then((m) => m.default),
  },
  {
    path: 'store/:storeId/products/new',
    canActivate: [authGuard, roleGuard('vendor')],
    loadComponent: () =>
      import('./pages/store/product-new/product-new.page').then(
        (m) => m.default
      ),
  },
  {
    path: 'store/:storeId/products/:id/edit',
    canActivate: [authGuard, roleGuard('vendor')],
    loadComponent: () =>
      import('./pages/store/product-edit/product-edit.page').then(
        (m) => m.default
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.page').then((m) => m.default),
  },
  {
    path: 'cart/checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cart/checkout/checkout.page').then((m) => m.default),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/orders.page').then((m) => m.default),
  },
  {
    path: 'orders/:orderId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/order-detail/order-detail.page').then(
        (m) => m.default
      ),
  },
];
