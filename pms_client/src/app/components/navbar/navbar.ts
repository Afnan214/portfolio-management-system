import { Component, inject } from '@angular/core';
import { ChevronDown, LucideAngularModule, Menu, X } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);

  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly X = X;
  mobileMenuOpen = false;

  isLoggedIn = this.authService.isAuthenticated();

  logout() {
    this.authService.logout();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
