# LifeLog Backend

Backend API server for the LifeLog application built with Fastify and TypeScript.

## Project Structure

```
src/
├── middleware/          # Custom middleware functions
│   ├── auth.ts         # Authentication middleware
│   ├── error.ts        # Error handling middleware
│   └── index.ts        # Middleware exports
├── models/             # Database models and schemas
│   └── schema.ts       # Drizzle ORM schema definitions
├── routes/             # API route handlers
│   ├── auth.ts         # Authentication routes
│   ├── health.ts       # Health check routes
│   └── index.ts        # Route registration
├── services/           # Business logic layer
│   ├── auth.service.ts # Authentication service
│   ├── user.service.ts # User management service
│   └── index.ts        # Service exports
├── types/              # TypeScript type definitions
│   ├── api.ts          # API response types
│   ├── fastify.d.ts    # Fastify type extensions
│   └── index.ts        # Type exports
├── utils/              # Utility functions
│   ├── auth.ts         # Better Auth configuration
│   ├── database.ts     # Database connection
│   ├── errors.ts       # Custom error classes
│   ├── helpers.ts      # Common helper functions
│   ├── validation.ts   # Input validation
│   └── index.ts        # Utility exports
└── server.ts           # Main server file
```

## Features

- **Fastify** - High-performance HTTP server
- **TypeScript** - Type safety across the stack
- **Drizzle ORM** - Type-safe database operations
- **Better Auth** - Authentication and session management
- **PostgreSQL** - Robust relational database
- **Error Handling** - Comprehensive error handling and logging
- **Middleware** - Authentication, logging, and error middleware
- **Modular Architecture** - Clean separation of concerns

## API Endpoints

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with database status

### Authentication

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user (protected)

### API Info

- `GET /api` - API information and available endpoints

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Environment Variables

See `.env` file for configuration options including database connection, authentication secrets, and server settings.
