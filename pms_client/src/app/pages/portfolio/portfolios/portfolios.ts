import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { PortfolioResponse } from '../../../services/portfolio-service';
import { AuthService } from '../../../auth/auth-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../services/portfolio-service';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolios.html',
  styleUrl: './portfolios.css',
})
export class Portfolios implements OnInit {
  private authService = inject(AuthService);
  private portfolioService = inject(PortfolioService);
  private cdr = inject(ChangeDetectorRef);

  portfolios: PortfolioResponse[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUserSnapshot();

    if (!currentUser) {
      this.isLoading = false;
      this.errorMessage = 'User is not authenticated.';
      this.cdr.detectChanges();
      return;
    }

    this.portfolioService.getPortfoliosByUserId(currentUser.id).subscribe({
      next: (response) => {
        this.portfolios = response;
        this.isLoading = false;
        console.log(this.portfolios);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load portfolios.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
