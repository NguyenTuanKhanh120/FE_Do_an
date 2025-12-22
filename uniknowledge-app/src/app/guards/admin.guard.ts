import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.currentUser();
  
  if (currentUser && currentUser.role === 'Admin') {
    return true;
  }
  // Không phải admin → redirect
  router.navigate(['/']);
  alert('Access denied. Admin only.');
  return false;
};