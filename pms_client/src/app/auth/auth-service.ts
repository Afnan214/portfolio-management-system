import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { RegisterRequest } from './register-request';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  message: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly authSessionKey = 'pms_auth_session';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.persistSessionHint();
          this.currentUserSubject.next({
            id: response.id,
            email: response.email,
          });
        }),
      );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.persistSessionHint();
          this.currentUserSubject.next({
            id: response.id,
            email: response.email,
          });
        }),
      );
  }

  getMe(): Observable<CurrentUser | null> {
    if (!this.hasSessionHint()) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.http
      .get<CurrentUser>(`${this.apiUrl}/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
        }),
        catchError(() => {
          this.clearSessionHint();
          this.currentUserSubject.next(null);
          return of(null);
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearSessionHint();
          this.currentUserSubject.next(null);
          console.log(this.getCurrentUserSnapshot());
        }),
      );
  }

  getCurrentUserSnapshot(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  hasCurrentUser(): boolean {
    return this.currentUserSubject.value !== null;
  }

  clearUser(): void {
    this.clearSessionHint();
    this.currentUserSubject.next(null);
  }

  private persistSessionHint(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.authSessionKey, 'true');
  }

  private clearSessionHint(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(this.authSessionKey);
  }

  private hasSessionHint(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(this.authSessionKey) === 'true';
  }
}
