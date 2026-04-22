import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';
import { RegisterRequest } from '../../auth/register-request';
import { Navbar } from '../../components/navbar/navbar';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private authService = inject(AuthService);
  private router = inject(Router);
  formData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };
  message = '';
  errorMessage = '';
  isSubmitting = false;
  submitAttempted = false;

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    this.submitAttempted = true;
    this.formData = {
      ...this.formData,
      email: this.formData.email.trim(),
    };

    this.message = '';
    this.errorMessage = '';

    if (!this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;
    this.authService.register(this.formData).subscribe({
      next: (response) => {
        console.log('Register success:', response);
        this.message = 'registration successful.';
        this.formData = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        };
        this.isSubmitting = false;

        this.router.navigate(['/console/dashboard']);
      },
      error: (error) => {
        console.log('Register failed', error);
        this.errorMessage = 'Registration failed.';
        this.isSubmitting = false;
      },
    });
  }

  isValidEmail(email: string): boolean {
    return this.emailPattern.test(email);
  }
}
