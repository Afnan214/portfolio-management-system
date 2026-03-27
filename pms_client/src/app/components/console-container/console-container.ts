import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, Menu } from 'lucide-angular';
import { SidebarService } from '../sidebar/sidebar-service';

@Component({
  selector: 'app-console-container',
  standalone: true,
  imports: [Sidebar, RouterOutlet, LucideAngularModule],
  templateUrl: './console-container.html',
  styleUrl: './console-container.css',
})
export class ConsoleContainer {
  Menu = Menu;
  constructor(public sidebarService: SidebarService) {}
}
