import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';



export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'tags',
    loadComponent: () => import('./components/tags/tags.component').then(m => m.TagsComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'questions/new',
    loadComponent: () => import('./components/create-question/create-question.component').then(m => m.CreateQuestionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'questions/:id/edit',
    loadComponent: () => import('./components/edit-question/edit-question.component').then(m => m.EditQuestionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'questions/:id',
    loadComponent: () => import('./components/question-detail/question-detail.component').then(m => m.QuestionDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./components/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/categories',
    loadComponent: () => import('./components/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/tags',
    loadComponent: () => import('./components/admin-tags/admin-tags.component').then(m => m.AdminTagsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./components/public-profile/public-profile.component').then(m => m.PublicProfileComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  },
];
