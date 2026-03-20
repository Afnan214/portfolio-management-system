import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../services/portfolio-service';

@Component({
  selector: 'app-create-portfolio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-portfolio.html',
  styleUrl: './create-portfolio.css',
})
export class CreatePortfolio {
  private fb = inject(FormBuilder);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  portfolioForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    cashBalance: [0, [Validators.required, Validators.min(0)]],
    isDefault: [false],
  });

  onSubmit(): void {
    if (this.portfolioForm.invalid) {
      this.portfolioForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.portfolioService.createPortfolio(this.portfolioForm.getRawValue()).subscribe({
      next: (portfolio) => {
        this.isSubmitting = false;
        this.router.navigate(['console/portfolios', portfolio.id]);
        this.successMessage = 'Portfolio created successfully.';
        this.portfolioForm.reset({
          name: '',
          cashBalance: 0,
          isDefault: false,
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create portfolio.';
      },
    });
  }
}
