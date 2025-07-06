# 🚀 Marketplace Client

A modern, full-stack-ready marketplace web app built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**. This project features a clean authentication flow, role-based dashboards, and a scalable architecture for rapid development.

---

## ✨ Features

- 🔒 Modern authentication (login/register) with role-based access (Student, Employer, Admin)
- 🎨 Beautiful, responsive UI with [shadcn/ui](https://ui.shadcn.com/) and Tailwind v4
- 🧑‍🎓 Student, 🏢 Employer, and 🛡️ Admin dashboards (with protected routes)
- 🪪 JWT-based middleware for secure route protection
- 🧩 Modular structure: features, hooks, store, types, utils
- 🌙 Dark mode ready (customizable via Tailwind)
- ⚡️ Fast, accessible, and production-ready

---

## 🛠️ Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, SSR, API routes)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)
- [lucide-react](https://lucide.dev/) (icons)
- [react-hook-form](https://react-hook-form.com/) (forms)
- [jose](https://github.com/panva/jose) (JWT)
- [TypeScript](https://www.typescriptlang.org/)

---

## ⚡️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser
http://localhost:3000
```

---

## 📁 Directory Structure

```text
src/
  app/           # Next.js app directory (routes, pages, layouts)
    (auth)/      # Auth pages (login, register)
    (student)/   # Student dashboard
    (employer)/  # Employer dashboard
    (admin)/     # Admin dashboard
    globals.css  # Tailwind & global styles
    layout.tsx   # App layout
    page.tsx     # Landing page
  components/    # Reusable UI components (shadcn/ui)
  features/      # Feature modules (business logic)
  hooks/         # Custom React hooks
  lib/           # Utilities, constants
  store/         # State management (e.g., Zustand, Redux)
  types/         # TypeScript types & interfaces
  utils/         # Helper functions
```

---

## 🧑‍💻 Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

All contributions are welcome! Please see the code structure and follow the conventions.

---

## 📜 License

[MIT](LICENSE)

---

## 🙌 Acknowledgements

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/)

---

> Made with ❤️ by the Marketplace Team
