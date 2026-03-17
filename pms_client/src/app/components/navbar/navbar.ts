import { Component } from '@angular/core';
import { LucideAngularModule, ChevronDown, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly X = X;
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
