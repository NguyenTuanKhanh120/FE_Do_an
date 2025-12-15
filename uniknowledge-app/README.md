# UniKnowledge - Stack Overflow Clone

Ứng dụng Q&A (Hỏi đáp) giống Stack Overflow được xây dựng với Angular và .NET.

## Tính năng

- ✅ Đăng ký / Đăng nhập người dùng với JWT Authentication
- ✅ Đặt câu hỏi với tiêu đề, nội dung, category và tags
- ✅ Trả lời câu hỏi
- ✅ Vote (upvote/downvote) câu hỏi và câu trả lời
- ✅ Chấp nhận câu trả lời (accept answer) cho câu hỏi của bạn
- ✅ Tìm kiếm và lọc câu hỏi theo category, tag, từ khóa
- ✅ Xem danh sách câu hỏi popular tags và categories
- ✅ UI đẹp với Tailwind CSS
- ✅ Responsive design cho mobile và desktop

## Công nghệ sử dụng

### Frontend
- **Angular 20** - Framework chính
- **TypeScript** - Ngôn ngữ lập trình
- **Tailwind CSS** - Styling framework
- **RxJS** - Reactive programming
- **Angular Router** - Navigation
- **Angular Forms** - Form handling
- **HttpClient** - API communication

### Backend
- **.NET 9** - Framework backend
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT** - Authentication

## Cấu trúc dự án

```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── home/           # Trang chủ - danh sách câu hỏi
│   │   ├── login/          # Đăng nhập
│   │   ├── register/       # Đăng ký
│   │   ├── navbar/         # Navigation bar
│   │   ├── question-detail/# Chi tiết câu hỏi
│   │   └── create-question/# Tạo câu hỏi mới
│   ├── models/             # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── question.model.ts
│   │   ├── answer.model.ts
│   │   ├── category.model.ts
│   │   ├── tag.model.ts
│   │   └── vote.model.ts
│   ├── services/           # Angular services
│   │   ├── auth.service.ts
│   │   ├── question.service.ts
│   │   ├── answer.service.ts
│   │   ├── category.service.ts
│   │   ├── tag.service.ts
│   │   └── vote.service.ts
│   ├── interceptors/       # HTTP interceptors
│   │   └── auth.interceptor.ts
│   ├── guards/             # Route guards
│   │   └── auth.guard.ts
│   └── app.routes.ts       # Routing configuration
```

## Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 20.x
- .NET SDK 9.0
- SQL Server

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Backend

Đảm bảo backend .NET đang chạy trên `http://localhost:5134`

Nếu backend chạy trên port khác, cập nhật API URL trong các service files:
- `src/app/services/auth.service.ts`
- `src/app/services/question.service.ts`
- `src/app/services/answer.service.ts`
- `src/app/services/category.service.ts`
- `src/app/services/tag.service.ts`
- `src/app/services/vote.service.ts`

## Chạy ứng dụng

### Development mode

```bash
npm start
```

Ứng dụng sẽ chạy trên `http://localhost:4200`

### Build production

```bash
npm run build
```

Build output sẽ được lưu trong thư mục `dist/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### Questions
- `GET /api/questions` - Lấy danh sách câu hỏi (với filter)
- `GET /api/questions/:id` - Lấy chi tiết câu hỏi
- `POST /api/questions` - Tạo câu hỏi mới (yêu cầu auth)
- `PUT /api/questions/:id` - Cập nhật câu hỏi (yêu cầu auth)
- `DELETE /api/questions/:id` - Xóa câu hỏi (yêu cầu auth)

### Answers
- `GET /api/questions/:id/answers` - Lấy câu trả lời của câu hỏi
- `POST /api/questions/:id/answers` - Thêm câu trả lời (yêu cầu auth)
- `PUT /api/answers/:id` - Cập nhật câu trả lời (yêu cầu auth)
- `DELETE /api/answers/:id` - Xóa câu trả lời (yêu cầu auth)
- `PUT /api/answers/:id/accept` - Chấp nhận câu trả lời (yêu cầu auth)

### Categories
- `GET /api/categories` - Lấy danh sách categories
- `GET /api/categories/:id` - Lấy chi tiết category

### Tags
- `GET /api/tags` - Lấy danh sách tags
- `GET /api/tags/popular` - Lấy tags phổ biến
- `GET /api/tags/:id` - Lấy chi tiết tag

### Votes
- `POST /api/questions/:id/vote` - Vote câu hỏi (yêu cầu auth)
- `POST /api/answers/:id/vote` - Vote câu trả lời (yêu cầu auth)
- `DELETE /api/questions/:id/vote` - Xóa vote câu hỏi (yêu cầu auth)
- `DELETE /api/answers/:id/vote` - Xóa vote câu trả lời (yêu cầu auth)

## Tính năng chính

### 1. Authentication
- Đăng ký với username, email, password
- Đăng nhập với email và password
- JWT token được lưu trong localStorage
- Auto-redirect khi chưa đăng nhập

### 2. Câu hỏi (Questions)
- Tạo câu hỏi với title, content, category và tags
- Chỉnh sửa/xóa câu hỏi của mình
- Xem chi tiết câu hỏi với tất cả câu trả lời
- Tìm kiếm theo từ khóa
- Lọc theo category và tag
- Vote (upvote/downvote)
- View count tự động tăng

### 3. Câu trả lời (Answers)
- Trả lời câu hỏi
- Chỉnh sửa/xóa câu trả lời của mình
- Chủ câu hỏi có thể accept answer
- Vote (upvote/downvote)

### 4. UI/UX
- Responsive design
- Modern UI với Tailwind CSS
- Loading states
- Error handling
- Form validation
- Mobile-friendly navigation

## Hướng dẫn sử dụng

### 1. Đăng ký tài khoản
- Truy cập `/register`
- Điền thông tin: username, email, password
- Click "Create account"

### 2. Đăng nhập
- Truy cập `/login`
- Nhập email và password
- Click "Sign in"

### 3. Đặt câu hỏi
- Click "Ask Question" trên navbar
- Nhập tiêu đề (tối thiểu 10 ký tự)
- Nhập nội dung chi tiết (tối thiểu 20 ký tự)
- Chọn category
- Chọn tags (ít nhất 1 tag)
- Click "Post Question"

### 4. Trả lời câu hỏi
- Vào chi tiết câu hỏi
- Cuộn xuống form "Your Answer"
- Nhập câu trả lời (tối thiểu 20 ký tự)
- Click "Post Answer"

### 5. Vote
- Click nút mũi tên lên để upvote
- Click nút mũi tên xuống để downvote

### 6. Accept Answer
- Chỉ chủ câu hỏi mới có thể accept
- Click "Accept Answer" trên câu trả lời tốt nhất

## Lưu ý

- Đảm bảo backend API đang chạy trước khi start frontend
- Token JWT có thời hạn, cần đăng nhập lại khi hết hạn
- Một số tính năng yêu cầu authentication (tạo câu hỏi, trả lời, vote)
- Vote và accept answer chỉ có thể thực hiện khi đã đăng nhập

## License

MIT
