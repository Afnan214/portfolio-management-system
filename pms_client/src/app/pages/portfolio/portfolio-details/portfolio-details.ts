import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService, PortfolioResponse } from '../portfolio-service';

@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-details.html',
  styleUrl: './portfolio-details.css',
})
export class PortfolioDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(PortfolioService);
  private cdr = inject(ChangeDetectorRef);

  portfolio: PortfolioResponse | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('idParam:', idParam);

    if (!idParam) {
      this.isLoading = false;
      this.errorMessage = 'Portfolio id is missing.';
      this.cdr.detectChanges();
      return;
    }

    const portfolioId = Number(idParam);

    if (Number.isNaN(portfolioId)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid portfolio id.';
      this.cdr.detectChanges();
      return;
    }

    this.portfolioService.getPortfolioById(portfolioId).subscribe({
      next: (response) => {
        console.log('response:', response);
        this.portfolio = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load portfolio.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
