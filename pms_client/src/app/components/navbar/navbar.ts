import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ChevronDown, LucideAngularModule, Menu, X } from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly X = X;

  mobileMenuOpen = false;

  isLoggedIn$ = this.authService.currentUser$.pipe(map((user) => user !== null));

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearUser();
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
      },
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
