import { Component, HostListener } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-landing-page',
  imports: [Navbar],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  scrollY = 0;

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY = window.scrollY;
  }
}
