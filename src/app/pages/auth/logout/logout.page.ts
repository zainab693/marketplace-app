import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  templateUrl: 'logout.page.html',
  styleUrls: ['logout.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner],
})
export default class LogoutPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.handleLogout();
  }

  private async handleLogout() {
    try {
      await this.auth.logout();
    } finally {
      this.router.navigate(['/']);
    }
  }
}
