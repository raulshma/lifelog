# LifeLog Backend

A high-performance REST API server built with Fastify and TypeScript for the LifeLog application.

## Features

- **Fastify Framework**: High-performance HTTP server with TypeScript support
- **Security**: CORS and Helmet middleware for security headers
- **Environment Configuration**: Environment-based configuration with validation
- **Error Handling**: Global error handling with structured responses
- **Health Checks**: Built-in health check endpoint
- **Development Tools**: Hot reloading with nodemon and ts-node

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Start development server with hot reloading
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### API Info
- **GET** `/api` - API information and version

## Project Structure

```
src/
├── routes/          # API route handlers
├── services/        # Business logic layer
├── models/          # Database models and schemas
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── server.ts        # Main server file
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build directory

## Development

The server runs on `http://localhost:3001` by default in development mode with:
- Hot reloading via nodemon
- Pretty logging via pino-pretty
- CORS enabled for frontend development
- TypeScript compilation on-the-fly

## Production

For production deployment:
1. Set `NODE_ENV=production`
2. Run `npm run build`
3. Start with `npm start`