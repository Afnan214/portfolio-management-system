import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth-service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  message = '';
  errorMessage = '';

  formData = {
    email: '',
    password: '',
  };

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    this.formData = {
      email: this.formData.email.trim(),
      password: this.formData.password,
    };

    this.message = '';
    this.errorMessage = '';
    this.setSubmittingState(true);

    this.authService
      .login(this.formData)
      .pipe(
        finalize(() => {
          this.setSubmittingState(false);
        }),
      )
      .subscribe({
        next: async (response) => {
          console.log('Login success:', response);
          this.message = 'Login successful.';

          this.formData = {
            email: '',
            password: '',
          };

          this.cdr.detectChanges();
          await this.router.navigate(['/console/dashboard']);
        },
        error: (error) => {
          console.log('Login failed', error);

          if (error.status === 401 || error.status === 403) {
            this.errorMessage = 'Invalid email or password.';
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }

          this.cdr.detectChanges();
        },
      });
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
    this.cdr.detectChanges();
  }
}
