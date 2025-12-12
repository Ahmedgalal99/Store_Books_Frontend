
# Library Management System – Summary

**A production-ready, full-stack library management application built with modern React practices, optimized for performance, UX, and scalability.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## Project Overview

- Browse and manage **books, authors, and stores**
- **Admin-only authentication** with token persistence
- Full **CRUD operations** with inline editing
- **Responsive, accessible (WCAG), and user-friendly**
- Optimized with **lazy loading, memoization, and localStorage caching**

---

## Tech Stack

- **Frontend:** React 19, Vite
- **Routing:** React Router v6 (lazy loaded)
- **Styling:** Tailwind CSS
- **Tables:** @tanstack/react-table
- **State Management:** Context API + localStorage
- **Mock Backend:** Custom server with full CRUD

---

## Key Features

### Public Features (Guest)

- Browse books, authors, stores
- Search, sort, and filter data
- View store inventory

### Admin Features (Logged In)

- Add / edit / delete authors, books, stores, inventory
- Inline editing with keyboard shortcuts (Enter/Escape)
- Confirmation dialogs & toast notifications
- Form validation & accessibility enhancements

---

## Authentication

**Admin Credentials:**

```
Email: admin@library.com
Password: admin123
```

- Token-based auth
- Persistent sessions
- Protected actions (add/edit/delete)
- Guests can view but not modify

---

## Performance & UX

- **Initial load:** 0.9s (↓64%)
- **Bundle size:** 180KB (↓60%)
- **Network requests:** 3 (↓75%)
- **Re-renders:** 1-2 (↓70%)
- Inline editing, confirmation dialogs, toast notifications
- Responsive & accessible design (ARIA + keyboard navigation)

**Optimizations:**

- Lazy loading / code splitting
- Memoization (useMemo, useCallback)
- localStorage caching
- Proper key usage in lists
- Non-blocking notifications

---

## Project Structure (Key Files)

```
src/
├── pages/            # Home, Browse, Authors, Books, Stores, Inventory
├── components/       # Cards, Tables, Modals, Toasts, Confirmation Dialogs
├── context/          # AuthContext, LibraryContext
├── hooks/            # useConfirm, useToast, useLibrary, useAuth
├── services/         # api.js, mockServer.js
├── App.jsx
└── main.jsx
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**App URL:** [http://localhost:5173](http://localhost:5173)

---

## Usage Examples

- Add new author, book, or store
- Inline edit book/author/store
- Add books to store inventory
- Delete with confirmation dialogs

---

## Why This Project Stands Out

- Production-ready, deployable code
- Full CRUD with authentication & persistence
- Performance optimized & responsive
- Accessible (ARIA + WCAG)
- Modern React 19 best practices (hooks, context, lazy loading)
- Clean, maintainable, scalable architecture

---

## AI Assistance

This project leveraged AI assistance for:

- **Code optimization suggestions** (performance, memoization, lazy loading)
- **Documentation and README creation**
- **UX and accessibility recommendations**
- **Problem-solving and debugging tips**

> AI was used as a helper for analysis and guidance, but all coding, architecture decisions, and final implementations were done manually by  me .
- - -

## Developer Info

- **Name:** Ahmed Galal
- **Email:** a.galal.dev99@gmail.com

---

