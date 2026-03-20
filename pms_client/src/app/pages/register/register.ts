import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';
import { RegisterRequest } from '../../auth/register-request';
import { Navbar } from '../../components/navbar/navbar';
import { Router, RouterLink } from '@angular/router';
import { LandingPage } from '../landing-page/landing-page';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
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
  onSubmit() {
    this.message = '';
    this.errorMessage = '';
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
}
