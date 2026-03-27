import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  LogOut
} from 'lucide-angular';
import { AuthService } from '../../auth/auth-service';

interface ToggleSetting {
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  User = User;
  Bell = Bell;
  Shield = Shield;
  Palette = Palette;
  Globe = Globe;
  Monitor = Monitor;
  Moon = Moon;
  Sun = Sun;
  ChevronRight = ChevronRight;
  ToggleLeft = ToggleLeft;
  ToggleRight = ToggleRight;
  Lock = Lock;
  Eye = Eye;
  EyeOff = EyeOff;
  Mail = Mail;
  Smartphone = Smartphone;
  Logout = LogOut

  activeTab = 'general';

  tabs = [
    { id: 'general', label: 'General', icon: this.Monitor },
    { id: 'notifications', label: 'Notifications', icon: this.Bell },
    { id: 'security', label: 'Security', icon: this.Shield },
    { id: 'appearance', label: 'Appearance', icon: this.Palette },
    { id: 'logout', label: 'Logout', icon: this.Logout },

  ];

  // General settings
  language = 'en';
  timezone = 'America/New_York';
  currency = 'USD';

  // Notification settings
  notifications: ToggleSetting[] = [
    { label: 'Email notifications', description: 'Receive trade confirmations and account alerts via email', enabled: true },
    { label: 'Push notifications', description: 'Get real-time alerts on your browser', enabled: false },
    { label: 'Price alerts', description: 'Notify when a stock hits your target price', enabled: true },
    { label: 'Portfolio updates', description: 'Daily summary of portfolio performance', enabled: true },
    { label: 'News & insights', description: 'Market news and investment insights', enabled: false },
    { label: 'Security alerts', description: 'Login attempts and account activity', enabled: true },
  ];

  // Security settings
  twoFactorEnabled = false;
  sessionTimeout = '30';
  showApiKey = false;
  fakeApiKey = 'mk_live_51Hx••••••••••••••••••••';

  // Appearance settings
  theme = 'light';
  compactMode = false;
  animationsEnabled = true;
  fontSize = 'medium';

  toggleNotification(index: number) {
    this.notifications[index].enabled = !this.notifications[index].enabled;
  }

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
}
