# Hướng dẫn Setup và Chạy Frontend Angular

## 📦 Cài đặt

### 1. Cài đặt dependencies

Trong thư mục `FE/uniknowledge-app`, chạy:

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các packages cần thiết bao gồm:
- Angular 20
- Tailwind CSS
- RxJS
- TypeScript
- và các dependencies khác

### 2. Cấu hình Backend URL

Mặc định, frontend kết nối với backend tại `http://localhost:5134`.

Nếu backend của bạn chạy ở địa chỉ khác, hãy cập nhật trong các service files:

**File cần cập nhật:**
- `src/app/services/auth.service.ts`
- `src/app/services/question.service.ts`
- `src/app/services/answer.service.ts`
- `src/app/services/category.service.ts`
- `src/app/services/tag.service.ts`
- `src/app/services/vote.service.ts`

Tìm và thay đổi dòng:
```typescript
private apiUrl = 'http://localhost:5134/api/...';
```

## 🚀 Chạy ứng dụng

### Development Mode

```bash
npm start
```

hoặc

```bash
ng serve
```

Ứng dụng sẽ chạy tại: `http://localhost:4200`

Trình duyệt sẽ tự động reload khi bạn thay đổi code.

### Production Build

```bash
npm run build
```

hoặc

```bash
ng build --configuration production
```

Build output sẽ được tạo trong thư mục `dist/`.

## 🎨 Tailwind CSS

Tailwind CSS đã được cấu hình sẵn. Các file quan trọng:

- `tailwind.config.js` - Cấu hình Tailwind
- `postcss.config.js` - PostCSS config
- `src/styles.scss` - Global styles với Tailwind directives

### Sử dụng Tailwind classes

Bạn có thể sử dụng Tailwind classes trong templates:

```html
<div class="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
```

### Custom colors

Primary color đã được cấu hình trong `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... more shades
    900: '#1e3a8a',
  }
}
```

Sử dụng: `bg-primary-600`, `text-primary-500`, etc.

## 📁 Cấu trúc Code

### Components

```
src/app/components/
├── home/                 # Trang chủ - danh sách câu hỏi
├── login/               # Đăng nhập
├── register/            # Đăng ký
├── navbar/              # Navigation bar
├── question-detail/     # Chi tiết câu hỏi và câu trả lời
├── create-question/     # Form tạo câu hỏi mới
├── tags/                # Danh sách tags
└── categories/          # Danh sách categories
```

### Services

```
src/app/services/
├── auth.service.ts      # Authentication (login, register, logout)
├── question.service.ts  # CRUD questions
├── answer.service.ts    # CRUD answers
├── category.service.ts  # Get categories
├── tag.service.ts       # Get tags
└── vote.service.ts      # Vote questions/answers
```

### Models

```
src/app/models/
├── user.model.ts        # User, AuthResponse, LoginRequest, RegisterRequest
├── question.model.ts    # Question, CreateQuestionRequest, UpdateQuestionRequest
├── answer.model.ts      # Answer, CreateAnswerRequest, UpdateAnswerRequest
├── category.model.ts    # Category
├── tag.model.ts         # TagDetail, CreateTagRequest
└── vote.model.ts        # VoteRequest
```

### Interceptors & Guards

```
src/app/interceptors/
└── auth.interceptor.ts  # Tự động thêm JWT token vào requests

src/app/guards/
└── auth.guard.ts        # Bảo vệ routes yêu cầu authentication
```

## 🔐 Authentication Flow

1. User đăng nhập/đăng ký
2. Backend trả về JWT token
3. Token được lưu trong `localStorage`
4. `AuthInterceptor` tự động thêm token vào tất cả HTTP requests
5. `AuthGuard` kiểm tra authentication trước khi truy cập protected routes

### Protected Routes

Các route yêu cầu authentication:
- `/questions/new` - Tạo câu hỏi mới

Các action yêu cầu authentication:
- Tạo, sửa, xóa câu hỏi
- Trả lời câu hỏi
- Vote
- Accept answer

## 🔄 State Management

Ứng dụng sử dụng Angular Signals để quản lý state:

```typescript
// Reactive state với signals
currentUser = signal<User | null>(null);
isAuthenticated = signal<boolean>(false);

// Đọc value
const user = this.currentUser();

// Cập nhật value
this.currentUser.set(newUser);
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với Tailwind CSS breakpoints:

- `sm:` - >= 640px
- `md:` - >= 768px
- `lg:` - >= 1024px
- `xl:` - >= 1280px

Example:
```html
<!-- Mobile: full width, Desktop: max width 7xl -->
<div class="w-full max-w-7xl mx-auto">
  <!-- Mobile: column, Desktop: row -->
  <div class="flex flex-col md:flex-row gap-4">
    ...
  </div>
</div>
```

## 🐛 Debugging

### Xem API calls

Mở DevTools (F12) > Network tab để xem tất cả HTTP requests.

### Xem state

Console log state trong components:
```typescript
console.log('Current user:', this.authService.currentUser());
console.log('Questions:', this.questions());
```

### Common Issues

**1. CORS Error**
- Đảm bảo backend đã cấu hình CORS cho `http://localhost:4200`

**2. 401 Unauthorized**
- Token có thể đã hết hạn, thử đăng nhập lại
- Kiểm tra token trong localStorage: `localStorage.getItem('token')`

**3. Cannot connect to backend**
- Đảm bảo backend đang chạy
- Kiểm tra URL trong services

## 🧪 Testing

Chạy unit tests:
```bash
npm test
```

hoặc

```bash
ng test
```

## 📦 Build Production

### Bước 1: Build
```bash
npm run build
```

### Bước 2: Deploy
Upload thư mục `dist/uniknowledge-app/browser` lên hosting (Netlify, Vercel, etc.)

### Environment Variables

Để sử dụng các URL khác nhau cho dev/prod, tạo environment files:

**src/environments/environment.ts** (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5134/api'
};
```

**src/environments/environment.prod.ts** (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

Sử dụng:
```typescript
import { environment } from '../environments/environment';

private apiUrl = environment.apiUrl;
```

## 📚 Học thêm

### Angular Documentation
- [Angular Docs](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Angular Router](https://angular.dev/guide/routing)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra lỗi trong Console (F12)
2. Kiểm tra Network tab để xem API calls
3. Đảm bảo backend đang chạy
4. Đọc lại hướng dẫn setup

## 📝 Notes

- Dùng `ng generate component <name>` để tạo component mới
- Dùng `ng generate service <name>` để tạo service mới
- Luôn run `npm install` sau khi pull code mới
- Code được auto-format khi save (nếu dùng VS Code với Prettier)

Happy coding! 🚀

