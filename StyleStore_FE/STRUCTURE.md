# StyleStore Frontend - Cấu Trúc Dự Án

## 📁 Cấu trúc thư mục (Đã chuẩn hóa theo React Best Practices)

```
StyleStore_FE/
├── public/                      # Static assets (favicon, images)
├── src/
│   ├── assets/                  # Media files (images, icons, SVG)
│   │   └── react.svg
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Admin/              # Admin-specific components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ComfirmModal.tsx
│   │   │   ├── RevenureChart.tsx
│   │   │   └── UserChart.tsx
│   │   ├── ConfirmDialog.tsx   # Shared components
│   │   └── ToastProvider.tsx
│   │
│   ├── layouts/                 # Layout components
│   │   └── AdminLayout.tsx     # Admin dashboard layout với Sidebar
│   │
│   ├── pages/                   # Page components (theo route)
│   │   ├── Admin/              # Admin pages
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.page.tsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── UserManage/
│   │   │   │   ├── UserManager.page.tsx
│   │   │   │   ├── UserTable.tsx
│   │   │   │   └── UserModal.tsx
│   │   │   ├── ProductManage/
│   │   │   │   ├── ProductManage.page.tsx
│   │   │   │   ├── ProductTable.tsx
│   │   │   │   └── ProductModal.tsx
│   │   │   └── OrderManage/
│   │   │       └── OrderTable.tsx
│   │   ├── Auth/               # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── Customer/           # Customer-facing pages
│   │       └── Home.tsx
│   │
│   ├── services/                # API services & utilities
│   │   └── auth.ts             # Authentication service (JWT, headers)
│   │
│   ├── features/                # Feature modules (future use)
│   │
│   ├── App.tsx                  # Main app component với routing
│   ├── App.css                  # Global app styles
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global CSS + Tailwind imports
│
├── index.html
├── package.json
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript configuration
└── README.md

```

## 📋 Nguyên tắc tổ chức

### ✅ **assets/** - Chỉ chứa media files
- Images (PNG, JPG, SVG)
- Icons
- Fonts
- Static files không phải code

### ✅ **components/** - Reusable UI components
- Các component dùng chung (ConfirmDialog, ToastProvider)
- Component theo module (Admin/, Customer/)
- Không chứa business logic phức tạp

### ✅ **layouts/** - Layout wrappers
- AdminLayout: Sidebar + Outlet cho admin routes
- CustomerLayout (future): Header + Footer cho customer
- Shared layout structure

### ✅ **pages/** - Route-based pages
- Mỗi route có 1 page component
- Tổ chức theo role: Admin/, Auth/, Customer/
- Page-specific components nằm cùng folder

### ✅ **services/** - Business logic & API calls
- auth.ts: JWT, authentication helpers
- api.ts (future): Axios instance, interceptors
- Tách biệt logic khỏi UI

### ✅ **features/** - Feature modules (future)
- Cho các feature lớn, độc lập
- Mỗi feature có components, hooks, utils riêng

## 🔄 So sánh trước/sau

### ❌ Trước (Sai)
```
assets/
  ├── Admin/           # ❌ Code component nằm trong assets
  │   ├── AdminLayout.tsx
  │   ├── Common/      # ❌ Components lẫn với pages
  │   └── Dashboard/
  ├── Auth/            # ❌ Pages nằm trong assets
  └── Customer/
```

### ✅ Sau (Đúng)
```
layouts/
  └── AdminLayout.tsx  # ✅ Layout riêng biệt

components/
  └── Admin/           # ✅ Components theo module

pages/
  ├── Admin/           # ✅ Pages theo role/route
  ├── Auth/
  └── Customer/

assets/
  └── react.svg        # ✅ Chỉ chứa media
```

## 🎯 Lợi ích

1. **Dễ scale**: Thêm pages/components mới theo cấu trúc rõ ràng
2. **Dễ maintain**: Biết ngay đi đâu để tìm file
3. **Team collaboration**: Chuẩn industry standard
4. **Import paths**: Rõ ràng hơn (`./pages/Admin/` thay vì `./assets/Admin/`)
5. **Separation of concerns**: UI, logic, data tách biệt

## 📝 Import Path Examples

```tsx
// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import Dashboard from './pages/Admin/Dashboard/Dashboard.page';
import Login from './pages/Auth/Login';

// Components
import Sidebar from './components/Admin/Sidebar';
import ConfirmDialog from './components/ConfirmDialog';

// Services
import { getAuthToken } from './services/auth';

// Assets
import logo from './assets/logo.svg';
```

## 🚀 Next Steps (Improvements)

1. **Thêm hooks/** folder cho custom React hooks
2. **Thêm utils/** folder cho helper functions
3. **Thêm types/** folder cho TypeScript interfaces/types chung
4. **Thêm constants/** folder cho config constants
5. **Tách API calls** ra khỏi components vào services/
6. **Thêm context/** cho React Context API (Auth, Theme)

---

✅ **Cấu trúc đã được chuẩn hóa theo React Best Practices!**
