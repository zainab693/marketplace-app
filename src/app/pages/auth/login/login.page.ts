import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
  ],
})
export default class LoginPage {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  email = '';
  password = '';
  error = '';

  submit() {
    this.error = '';
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.auth.login(this.email, this.password).subscribe({
      next: (u) => {
        if (redirect) return this.router.navigateByUrl(redirect);
        if (u.roles.includes('vendor') && u.storeId)
          return this.router.navigate(['/store', u.storeId]);
        else return this.router.navigate(['/']);
      },
      error: (e) => (this.error = e?.message || 'Login failed'),
    });
  }
}
