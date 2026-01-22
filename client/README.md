# 🚀 Defense Client - Freelance Marketplace Platform

A modern, full-stack freelance marketplace web application built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. This platform connects freelancers (students) with clients (employers) through a comprehensive job posting, bidding, and communication system.

---

## ✨ Core Features

### 🔐 **Authentication & User Management**
- **Multi-role authentication**: Student (Freelancer), Client (Employer), and Admin roles
- **JWT-based authentication** with secure cookie storage
- **Profile management** with role-specific forms and data
- **Email verification** and password reset functionality
- **Google OAuth integration** for seamless login

### 💼 **Job Management System**
- **Job posting**: Clients can create detailed job listings with budgets, skills, and requirements
- **Advanced filtering**: Frontend-based filtering by title, category, skills, tags, budget, and status
- **Search functionality**: Real-time search with debouncing across job titles, descriptions, tags, and skills
- **Job categories & skills**: Comprehensive dropdown system for job classification
- **Budget management**: Support for both fixed-price and hourly-rate projects

### 🎯 **Bidding & Proposal System**
- **Bid submission**: Freelancers can submit detailed proposals with cover letters and attachments
- **Bid management**: Clients can review, accept, reject, or manage multiple bids
- **Status tracking**: Real-time bid status updates (pending, accepted, rejected, in-progress, completed)
- **Enhanced bid cards**: Job title display with direct navigation to job details

### 👥 **Profile & Portfolio System**
- **Dynamic profiles**: Role-based profile display (Student vs Client)
- **Portfolio showcase**: Project galleries, experience, education, and skills
- **Profile ownership**: Edit profile for owners, send message for visitors
- **Last 5 jobs display**: Recent job history for client profiles

### 💬 **Real-time Communication**
- **WebSocket-powered chat**: Real-time messaging between users
- **Typing indicators**: Live typing status and notifications
- **Message persistence**: Chat history and conversation management
- **Online status tracking**: User presence and availability indicators

### 🔔 **Notification System**
- **Real-time notifications**: WebSocket-based notification delivery
- **Audio notifications**: Customizable sound alerts
- **Toast notifications**: User-friendly feedback system
- **Network status monitoring**: Connection health and reconnection handling

---

## 🛠️ Technology Stack

### **Frontend Framework**
- [Next.js 15](https://nextjs.org/) - App Router, Server-Side Rendering, API routes
- [React 19](https://react.dev/) - Latest React with concurrent features
- [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development

### **Styling & UI**
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible UI components
- [Lucide React](https://lucide.dev/) - Consistent icon library
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations

### **State Management & Data Fetching**
- [Redux Toolkit](https://redux-toolkit.js.org/) - Predictable state management
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) - Powerful data fetching and caching
- [React Hook Form](https://react-hook-form.com/) - Performant forms with validation

### **Real-time Features**
- **WebSocket Manager**: Custom WebSocket implementation with reconnection logic
- **Chat System**: Real-time messaging with typing indicators
- **Notification Service**: Live updates and alerts

### **Authentication & Security**
- [Jose](https://github.com/panva/jose) - JWT handling and validation
- [js-cookie](https://github.com/js-cookie/js-cookie) - Secure cookie management
- **Middleware protection**: Route-level authentication guards

### **Development Tools**
- [ESLint](https://eslint.org/) - Code quality and consistency
- [PostCSS](https://postcss.org/) - CSS processing
- **Hot reloading** and development optimizations

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**
```bash
# 1. Clone the repository
git clone <repository-url>
cd defense-client

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start development server
npm run dev

# 5. Open your browser
http://localhost:3000
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 🏗️ Architecture Overview

### **Directory Structure**
```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login form
│   │   ├── register/      # Registration forms
│   │   └── reset-password/ # Password reset flow
│   ├── (root)/            # Protected application routes
│   │   ├── dashboard/     # Main job dashboard
│   │   ├── profile/       # User profile management
│   │   ├── messages/      # Chat and messaging
│   │   ├── my-jobs/       # Client job management
│   │   ├── my-bids/       # Freelancer bid management
│   │   └── view-bids/     # Bid review system
│   └── globals.css        # Global styles and Tailwind
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── chat/              # Chat system components
│   ├── navbar/            # Navigation components
│   └── profile/           # Profile-related components
├── features/               # Business logic modules
│   ├── api/               # RTK Query API definitions
│   ├── jobs/              # Job-related state management
│   └── userSlice.ts       # User state management
├── hooks/                  # Custom React hooks
├── services/               # External service integrations
│   ├── webSocketManager.ts # WebSocket connection management
│   ├── chatWebSocket.ts   # Chat WebSocket service
│   └── notificationWebSocket.ts # Notification service
├── store/                  # Redux store configuration
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and helpers
└── middleware.ts           # Next.js middleware
```

### **State Management Architecture**
- **Redux Toolkit**: Centralized state management
- **RTK Query**: API data fetching, caching, and synchronization
- **Feature-based organization**: Modular state slices for different domains
- **Type-safe selectors**: Full TypeScript integration with Redux

### **API Integration**
- **RESTful API endpoints**: Job management, user profiles, bidding system
- **Real-time WebSocket**: Chat, notifications, and live updates
- **Automatic caching**: RTK Query handles data synchronization
- **Error handling**: Comprehensive error management and user feedback

---

## 🔧 Key Components

### **Dashboard System**
- **Advanced filtering**: Multi-criteria job filtering with real-time results
- **Pagination**: Efficient data pagination for large job lists
- **Search optimization**: Debounced search with comprehensive field matching
- **Responsive design**: Mobile-first approach with Tailwind CSS

### **Profile Management**
- **Role-based profiles**: Different layouts for freelancers and clients
- **Edit capabilities**: In-place profile editing with modal forms
- **Media handling**: Avatar uploads and portfolio management
- **Responsive forms**: Mobile-optimized input layouts

### **Bidding System**
- **Enhanced bid cards**: Job context and navigation
- **Status management**: Comprehensive bid lifecycle tracking
- **Attachment support**: File uploads for proposals
- **Real-time updates**: Live status changes and notifications

### **Chat & Communication**
- **Room-based messaging**: Organized conversation management
- **Typing indicators**: Real-time user activity feedback
- **Message persistence**: Chat history and conversation continuity
- **WebSocket reliability**: Automatic reconnection and error handling

---

## 🌐 API Endpoints

### **Authentication**
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/reset-password` - Password reset

### **Jobs**
- `GET /jobs/` - Fetch job listings with filters
- `POST /jobs/` - Create new job
- `PUT /jobs/{id}` - Update job details
- `GET /jobs/dropdowns` - Get filter options

### **Profiles**
- `GET /accounts/info/{username}/` - Get user profile by username
- `PUT /accounts/me/` - Update current user profile
- `POST /accounts/upload-image/` - Upload profile image

### **Bids**
- `GET /jobs/{id}/bids/` - Get bids for a job
- `PUT /bids/{id}/status/` - Update bid status

---

## 🎨 UI/UX Features

### **Design System**
- **Consistent theming**: Unified color palette and typography
- **Component library**: Reusable UI components with shadcn/ui
- **Responsive layouts**: Mobile-first design approach
- **Accessibility**: ARIA labels and keyboard navigation

### **User Experience**
- **Real-time feedback**: Immediate response to user actions
- **Smooth animations**: Framer Motion-powered transitions
- **Loading states**: Skeleton loaders and progress indicators
- **Error handling**: User-friendly error messages and recovery

---

## 🔒 Security Features

### **Authentication & Authorization**
- **JWT tokens**: Secure token-based authentication
- **Role-based access**: Protected routes based on user roles
- **Middleware protection**: Route-level security enforcement
- **Secure cookies**: HttpOnly and secure cookie configuration

### **Data Protection**
- **Input validation**: Comprehensive form validation with Zod
- **XSS prevention**: Sanitized user input and output
- **CSRF protection**: Token-based request validation

---

## 🚀 Performance Optimizations

### **Frontend Performance**
- **Code splitting**: Dynamic imports and route-based splitting
- **Image optimization**: Next.js automatic image optimization
- **Bundle optimization**: Tree shaking and dead code elimination
- **Caching strategies**: RTK Query intelligent caching

### **Real-time Performance**
- **WebSocket optimization**: Efficient connection management
- **Message queuing**: Offline message handling
- **Connection pooling**: Resource-efficient WebSocket usage

---

## 🧪 Testing & Quality

### **Code Quality**
- **ESLint configuration**: Consistent code style enforcement
- **TypeScript strict mode**: Compile-time error prevention
- **Prettier integration**: Automated code formatting

### **Build Process**
- **Next.js optimization**: Production build optimizations
- **Type checking**: Comprehensive TypeScript validation
- **Linting**: Code quality and style enforcement

---

## 📱 Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive enhancement**: Graceful degradation for older browsers

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style and architecture
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all builds and tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Lucide](https://lucide.dev/) - Icon library

---

> Built with ❤️ by the Defense Client Team - Connecting talent with opportunity through innovative technology.
