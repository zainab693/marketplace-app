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
  // promise that resolves when initial restore is complete
  private _readyPromise: Promise<void>;
  private _readyResolve!: () => void;

  constructor(private http: HttpClient) {
    this._readyPromise = new Promise((res) => (this._readyResolve = res));
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
          // avoid storing sensitive fields like password
          const raw = list[0] as any;
          const { password: _pw, ...u } = raw;
          this._user$.next(u as AppUser);
          Preferences.set({ key: 'auth_user', value: JSON.stringify(u) });
          return u as AppUser;
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
    try {
      const saved = await Preferences.get({ key: 'auth_user' });
      if (saved.value) {
        try {
          const parsed = JSON.parse(saved.value) as AppUser;
          this._user$.next(parsed);
        } catch (e) {
          // corrupt saved value, clear it
          await Preferences.remove({ key: 'auth_user' });
          this._user$.next(null);
        }
      }
    } finally {
      // mark ready regardless of errors
      if (this._readyResolve) this._readyResolve();
    }
  }

  // allow callers (like guards) to wait for initial restore
  ready() {
    return this._readyPromise;
  }
}
