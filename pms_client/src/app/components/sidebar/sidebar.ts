import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  User,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  LayoutDashboard = LayoutDashboard;
  Briefcase = Briefcase;
  TrendingUp = TrendingUp;
  User = User;
  HelpCircle = HelpCircle;
  Settings = Settings;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;

  @Output() collapsedChange = new EventEmitter<boolean>();

  collapsed = false;

  navItems = [
    { label: 'Dashboard', icon: this.LayoutDashboard, route: '/dashboard' },
    { label: 'Portfolio', icon: this.Briefcase, route: '/portfolios' },
    { label: 'Market Overview', icon: this.TrendingUp, route: '/market' },
    { label: 'User Profile', icon: this.User, route: '/profile' },
    { label: 'Help Center', icon: this.HelpCircle, route: '/help' },
    { label: 'Settings', icon: this.Settings, route: '/settings' },
  ];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
