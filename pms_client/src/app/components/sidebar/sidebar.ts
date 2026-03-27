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
  X,
} from 'lucide-angular';
import { SidebarService } from './sidebar-service';

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
  X = X;
  constructor(public sidebarService: SidebarService) { }

  @Output() collapsedChange = new EventEmitter<boolean>();

  collapsed = false;

  navItems = [
    { label: 'Dashboard', icon: this.LayoutDashboard, route: '/console/dashboard' },
    { label: 'Portfolio', icon: this.Briefcase, route: '/console/portfolios' },
    { label: 'Market Overview', icon: this.TrendingUp, route: '/console/market' },
    { label: 'User Profile', icon: this.User, route: '/console/profile' },
    { label: 'Help Center', icon: this.HelpCircle, route: '/console/help' },
    { label: 'Settings', icon: this.Settings, route: '/console/settings' },
  ];

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  onNavClick() {
    this.sidebarService.closeMobile();
  }
}
