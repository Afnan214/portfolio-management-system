import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth-service';
import { RegisterRequest } from '../auth/register-request';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);

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
      },
      error: (error) => {
        console.log('Register failed', error);
        this.errorMessage = 'Registration failed.';
        this.isSubmitting = false;
      },
    });
  }
}
