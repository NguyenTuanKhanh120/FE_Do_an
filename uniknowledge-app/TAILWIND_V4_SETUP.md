# Setup Tailwind CSS v4 (Nếu bạn muốn dùng v4)

## Bước 1: Cài đặt @tailwindcss/postcss

```bash
npm install -D @tailwindcss/postcss@next tailwindcss@next
```

## Bước 2: Cập nhật postcss.config.js

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

## Bước 3: Cập nhật styles.scss

Thay đổi từ:
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Thành:
```scss
@import "tailwindcss";
```

## Bước 4: Xóa tailwind.config.js

Tailwind CSS v4 không cần file config nữa. Xóa file `tailwind.config.js`.

## Bước 5: Chạy lại

```bash
npm install
ng serve
```

---

**LƯU Ý:** Giải pháp 1 (dùng v3) đơn giản và ổn định hơn cho Angular!

