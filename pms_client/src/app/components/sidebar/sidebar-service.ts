// sidebar.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
    // Using Angular Signals (v17+) for easy state management
    isCollapsed = signal(false);
    isMobileOpen = signal(false);

    toggle() {
        this.isCollapsed.set(!this.isCollapsed());
    }

    openMobile() {
        this.isMobileOpen.set(true);
    }

    closeMobile() {
        this.isMobileOpen.set(false);
    }

    toggleMobile() {
        this.isMobileOpen.set(!this.isMobileOpen());
    }
}