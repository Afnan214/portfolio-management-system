import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Mail,
  Wallet,
  Plus,
  X,
  Pencil,
  Save,
  Shield,
  Phone,
  MapPin,
  Globe,
  Calendar,
} from 'lucide-angular';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private authService = inject(AuthService);

  // Lucide icons
  User = User;
  Mail = Mail;
  Wallet = Wallet;
  Plus = Plus;
  X = X;
  Pencil = Pencil;
  Save = Save;
  Shield = Shield;
  Phone = Phone;
  MapPin = MapPin;
  Globe = Globe;
  Calendar = Calendar;

  // Profile form data (mock)
  firstName = 'Jason';
  lastName = 'Doe';
  email = '';
  phone = '+1 (555) 234-5678';
  address = '1420 Rue Sainte-Catherine O';
  city = 'Montreal';
  country = 'Canada';
  dateOfBirth = '1992-06-15';

  // Edit mode
  isEditing = false;

  // Fund data (mock)
  totalFunds = 12500.0;

  // Add funds modal
  showAddFundsModal = false;
  addFundsAmount: number | null = null;

  constructor() {
    const user = this.authService.getCurrentUserSnapshot();
    if (user) {
      this.email = user.email;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    // Non-functional for now — just exit edit mode
    this.isEditing = false;
  }

  openAddFundsModal() {
    this.addFundsAmount = null;
    this.showAddFundsModal = true;
  }

  closeAddFundsModal() {
    this.showAddFundsModal = false;
  }

  confirmAddFunds() {
    if (this.addFundsAmount && this.addFundsAmount > 0) {
      this.totalFunds += this.addFundsAmount;
      this.closeAddFundsModal();
    }
  }

  getInitials(): string {
    return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
  }
}
