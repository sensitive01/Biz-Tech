# BizTech User-Frontend

Modern, modular, production-ready React 19 + Vite frontend application for BizTech multi-tenant business management.

---

## 📁 Clean Project Architecture

```
User-Frontend/src/
├── api/ (or services/)       # Centralized HTTP Client & Backend APIs
│   ├── api.js                # Unified fetch client (auth token injection, error handling)
│   ├── authService.js        # Auth, onboarding & profile requests
│   ├── employeeService.js    # Employees, attendance & leave request APIs
│   ├── businessService.js    # Multi-business & branch CRUD operations
│   └── index.js              # Barrel export for all services
│
├── components/               # Reusable UI & Layout Components
│   ├── common/               # Shared general-purpose widgets
│   │   ├── AlertModal.jsx    # Standardized in-app alert & confirm modal
│   │   ├── TablePagination.jsx # Unified table pagination controller
│   │   ├── ThemeToggle.jsx   # Dark / Light mode switch
│   │   └── LanguageSelector.jsx # Multi-language switcher
│   └── index.js              # Barrel export
│
├── constants/                # Centralized Enums & App Configuration
│   ├── routes.js             # Route path constants (ROUTES.TENANT.DASHBOARD, etc.)
│   ├── archetypes.js         # Business Archetypes (Type 1 to Type 4 definitions)
│   ├── roles.js              # Standard designation & work-type options
│   └── index.js              # Barrel export
│
├── context/                  # Global State Providers
│   ├── AuthContext.jsx       # Reactive auth state, user profile & permissions
│   ├── ThemeContext.jsx      # Reactive theme synchronization across tabs
│   └── index.js              # Barrel export
│
├── hooks/                    # Reusable Custom React Hooks
│   ├── useAuth.js            # Access current user, tenantType & auth methods
│   ├── useTheme.js           # Access current theme & toggle function
│   ├── useDebounce.js        # Debounce rapid input values (e.g. search bars)
│   ├── usePagination.js      # Declarative pagination logic for tables
│   └── index.js              # Barrel export
│
├── layouts/                  # Layout Wrappers
│   └── TenantLayout.jsx      # Authenticated tenant sidebar, top bar & content shell
│
├── pages/                    # Domain-Grouped Pages
│   ├── auth/                 # Login, Register, Impersonate
│   ├── onboarding/           # SelectType, SelectModules, Onboarding
│   ├── dashboard/            # TenantDashboard overview
│   ├── staff/                # Employees, Attendance, LeaveRequests
│   ├── operations/           # Products, Inventory, Purchases, Sales
│   ├── organization/         # Businesses, Branches, Investors
│   ├── finance/              # Billing, Expenses, Customers, Documents, Reminders
│   ├── profile/              # Account & business profile settings
│   ├── public/               # Landing page, 404 Not Found
│   └── index.js              # Barrel export of all domain pages
│
├── routes/                   # Routing Infrastructure
│   ├── ProtectedRoute.jsx    # Authentication route guard
│   ├── AppRoutes.jsx         # Declarative route configuration
│   └── index.js              # Barrel export
│
├── utils/                    # Utility Functions
│   ├── exportToCSV.js        # Universal CSV exporter
│   ├── formatDate.js        # Standard date and time formatters
│   └── index.js              # Barrel export
│
├── App.jsx                   # Lean root App (Providers + AppRoutes)
├── main.jsx                  # Application entry point
└── index.css                 # Global theme variables & styling
```

---

## 🚀 Key Architectural Improvements

### 1. `@/` Path Alias Support
All files can cleanly import across folders without ugly relative traversal (`../../../`):
```javascript
import { api, authService } from '@/services';
import { useAuth, useTheme } from '@/hooks';
import { ROUTES } from '@/constants';
import { Employees, LeaveRequests } from '@/pages';
import { TablePagination, ThemeToggle } from '@/components';
```

### 2. Grouped Domain Pages
Instead of 25 flat files dumped in `src/pages/`, pages are grouped by domain (`auth/`, `staff/`, `operations/`, `organization/`, `finance/`, `onboarding/`, `public/`).

### 3. Centralized API Service Layer (`@/services`)
Eliminates duplicated fetch calls and manual token headers across components. Automatic token injection and 401 handling are handled in `api.js`.

### 4. Reactive Context & Custom Hooks
`useAuth()` and `useTheme()` provide instant, reactive access to user authentication, permissions, and theme settings without direct `localStorage` parsing.

### 5. Modular Routing (`@/routes`)
`App.jsx` is reduced to a clean 20-line composition of global providers and `<AppRoutes />`.
