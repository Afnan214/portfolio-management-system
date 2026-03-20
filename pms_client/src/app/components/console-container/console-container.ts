import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-console-container',
  standalone: true,
  imports: [Sidebar, RouterOutlet],
  templateUrl: './console-container.html',
  styleUrl: './console-container.css',
})
export class ConsoleContainer { }
