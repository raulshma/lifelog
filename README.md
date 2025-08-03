# LifeLog

A comprehensive life organization application that unifies five essential aspects of digital and physical life management into a single, beautifully designed platform.

## 🌟 Features

**LifeLog** consists of five core modules:

- **📋 Day Tracker** - Productivity and task management with Kanban boards, task lists, and daily journaling
- **📚 Knowledge Base** - Research and information organization with rich-text notes, hierarchical structure, and tagging
- **🔐 Vault** - Secure credential and sensitive data storage with end-to-end encryption
- **📄 Document Hub** - Important document management with categorization, metadata, and expiration reminders
- **📦 Inventory** - Physical item location tracking with photos, QR codes, and lending management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lifelog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Environment files are automatically created from examples
   # Edit frontend/.env and backend/.env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Make sure PostgreSQL is running
   npm run db:push
   ```

5. **Start development servers**

   ```bash
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
lifelog/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── modules/          # Feature modules (Day Tracker, Knowledge Base, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── App.tsx           # Main application component
│   ├── public/               # Static assets
│   └── package.json
├── backend/                  # Fastify + TypeScript + PostgreSQL
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic layer
│   │   ├── models/           # Database models and schemas
│   │   ├── middleware/       # Custom middleware
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Main server file
│   ├── drizzle/              # Database migrations and schema
│   └── package.json
├── docs/                     # Project documentation
├── scripts/                  # Development and build scripts
├── .kiro/                    # Kiro IDE configuration and specs
└── package.json              # Root workspace configuration
```

## 🛠️ Development

### Available Scripts

#### Development

```bash
npm run dev                   # Start both frontend and backend
npm run dev:frontend          # Start frontend only
npm run dev:backend           # Start backend only
```

#### Building

```bash
npm run build                 # Build both applications
npm run build:frontend        # Build frontend only
npm run build:backend         # Build backend only
npm run build:prod            # Production build with validation
```

#### Code Quality

```bash
npm run lint                  # Run ESLint on all code
npm run lint:fix              # Auto-fix linting issues
npm run format                # Format code with Prettier
npm run format:check          # Check code formatting
npm run type-check            # Run TypeScript type checking
```

#### Testing

```bash
npm run test                  # Run all tests
npm run test:frontend         # Run frontend tests only
npm run test:backend          # Run backend tests only
```

#### Database

```bash
npm run db:generate           # Generate database migrations
npm run db:migrate            # Run database migrations
npm run db:push               # Push schema changes to database
npm run db:studio             # Open Drizzle Studio
```

#### Utilities

```bash
npm run clean                 # Clean build artifacts
npm run setup                 # Complete development environment setup
npm start                     # Start production server
```

### Environment Configuration

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=LifeLog
VITE_AUTH_URL=http://localhost:3001
VITE_ENABLE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug
```

#### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/lifelog
BETTER_AUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

## 🏗️ Architecture

### Technology Stack

**Frontend:**

- React 18 with TypeScript for type safety and modern React features
- Vite for fast development server and optimized builds
- Fluent UI React Components for consistent Microsoft design language
- React Router v6 for client-side routing
- React Query (TanStack Query) for server state management
- React Hook Form with Yup for form handling and validation

**Backend:**

- Fastify for high-performance HTTP server
- TypeScript for type safety across the stack
- Drizzle ORM for type-safe database operations
- PostgreSQL for robust relational database
- Better Auth for authentication and session management

**Development Tools:**

- ESLint with TypeScript rules for code linting
- Prettier for consistent code formatting
- Husky for Git hooks management
- Jest and React Testing Library for testing

### Design Principles

- **Mobile-First**: Responsive design optimized for mobile devices
- **Speed is a Feature**: Optimized for quick content capture and retrieval
- **Security by Design**: Robust encryption and security practices
- **Intuitive UX**: Clean, uncluttered interface that's a pleasure to use daily

## 🔧 Development Workflow

1. **Feature Development**

   ```bash
   git checkout -b feature/your-feature
   npm run dev
   # Make changes
   npm run lint:fix
   npm run test
   git commit -m "feat: your feature"
   ```

2. **Code Quality Checks**
   - Pre-commit hooks automatically run linting and formatting
   - Type checking runs on build
   - Tests should pass before committing

3. **Database Changes**
   ```bash
   # After modifying schema
   npm run db:generate
   npm run db:migrate
   ```

## 📚 Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed development setup and workflow
- [Requirements](docs/Requirements.md) - Complete project requirements and specifications
- [Tasks](docs/Tasks.md) - Development tasks and project roadmap
- [API Documentation](docs/api/) - API endpoints and usage (coming soon)
- [Component Library](docs/components/) - Frontend component documentation (coming soon)

## 🧪 Testing

The project uses a comprehensive testing strategy:

- **Unit Tests**: Jest with React Testing Library for component testing
- **Integration Tests**: API endpoint testing with Fastify testing utilities
- **End-to-End Tests**: Full application flow testing (planned)

Run tests with:

```bash
npm run test                  # All tests
npm run test:frontend         # Frontend tests only
npm run test:backend          # Backend tests only
```

## 🚀 Deployment

### Production Build

```bash
npm run build:prod
```

### Environment Setup

1. Set up production PostgreSQL database
2. Configure environment variables for production
3. Build and deploy both frontend and backend
4. Set up reverse proxy (nginx recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the established code style (ESLint + Prettier)
4. Write tests for new features
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages using conventional commits
- Add tests for new functionality
- Update documentation for significant changes

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Kill processes on ports 3001 and 5173
   npx kill-port 3001 5173
   ```

2. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in backend/.env
   - Run `npm run db:push` to sync schema

3. **TypeScript Errors**

   ```bash
   npm run type-check
   # Fix errors and run again
   ```

4. **Dependency Issues**
   ```bash
   rm -rf node_modules frontend/node_modules backend/node_modules
   npm install
   ```

For more detailed troubleshooting, see the [Development Guide](docs/DEVELOPMENT.md).

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new) if needed

---

**LifeLog** - Organize your digital and physical life with speed, security, and simplicity.
