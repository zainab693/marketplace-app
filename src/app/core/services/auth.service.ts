import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  storeId?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AppUser | null>(null);
  user$ = this._user$.asObservable();

  constructor(private http: HttpClient) {
    this.restore();
  }

  get user() {
    return this._user$.value;
  }
  isAuthenticated() {
    return !!this.user;
  }
  hasRole(role: 'vendor' | 'customer' | 'admin') {
    return !!this.user?.roles?.includes(role);
  }

  login(email: string, password: string) {
    // For mock: validate via json-server query
    return this.http
      .get<AppUser[]>(`${environment.apiBaseUrl}/users`, {
        params: { email, password },
      })
      .pipe(
        map((list) => {
          if (!list.length) throw new Error('Invalid credentials');
          const u = list[0];
          this._user$.next(u);
          Preferences.set({ key: 'auth_user', value: JSON.stringify(u) });
          return u;
        })
      );
  }

  register(name: string, email: string, password: string) {
    const newUser = { name, email, password, roles: ['customer'] };
    return this.http.post<AppUser>(`${environment.apiBaseUrl}/users`, newUser);
  }

  async logout() {
    this._user$.next(null);
    await Preferences.remove({ key: 'auth_user' });
  }

  private async restore() {
    const saved = await Preferences.get({ key: 'auth_user' });
    if (saved.value) this._user$.next(JSON.parse(saved.value));
  }
}
