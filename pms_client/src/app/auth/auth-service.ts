import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterRequest } from './register-request';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from './auth-response';
import { LoginRequest } from './login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'access_token';

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap((response) => {
        this.saveToken(response.accessToken);
      }),
    );
  }
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post(`${this.baseUrl}/login`, payload).pipe(
      tap((response: any) => {
        if (response?.accessToken) {
          this.saveToken(response.accessToken);
        }
      }),
    );
  }
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  logout(): void {
    this.http.get(`${this.baseUrl}/logout`).pipe(
      tap((response: any) => {
        if (response?.accessToken) {
          this.saveToken(response.accessToken);
        }
      }),
    );
    localStorage.removeItem(this.tokenKey);
  }
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
