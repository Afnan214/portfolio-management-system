// sidebar.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
    // Using Angular Signals (v17+) for easy state management
    isCollapsed = signal(false);

    toggle() {
        this.isCollapsed.set(!this.isCollapsed());
    }
}