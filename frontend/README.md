# LifeLog Frontend

The frontend application for LifeLog, built with React, TypeScript, and Vite. This modern web application provides a responsive, mobile-first interface for managing all aspects of digital and physical life organization.

## 🚀 Features

- **Modern React 19** with TypeScript for type safety
- **Vite** for lightning-fast development and optimized builds
- **Fluent UI** components for consistent Microsoft design language
- **React Query** for efficient server state management
- **React Router** for client-side routing
- **Mobile-first responsive design** that works seamlessly across devices
- **Progressive Web App (PWA)** capabilities for offline usage

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Modal)
│   ├── forms/          # Form-specific components
│   ├── navigation/     # Navigation components
│   └── layout/         # Layout components
├── modules/            # Feature modules
│   ├── day-tracker/    # Task management and Kanban boards
│   ├── knowledge-base/ # Notes and information organization
│   ├── vault/          # Secure credential storage
│   ├── document-hub/   # Document management
│   └── inventory/      # Physical item tracking
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── App.tsx             # Main application component
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Application: http://localhost:5173

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

## 🏗️ Architecture

### Component Architecture

The application follows atomic design principles:

- **Atoms**: Basic building blocks (Button, Input, Icon)
- **Molecules**: Simple combinations (SearchBox, FormField)
- **Organisms**: Complex components (Header, TaskBoard, NoteEditor)
- **Templates**: Page layouts
- **Pages**: Complete application pages

### State Management

- **Server State**: React Query for API data, caching, and synchronization
- **Global UI State**: React Context for theme, user preferences, and app-wide state
- **Local State**: useState/useReducer for component-specific state

### Routing Strategy

```typescript
// Nested routing with lazy loading
const DayTracker = React.lazy(() => import('./modules/DayTracker'));
const KnowledgeBase = React.lazy(() => import('./modules/KnowledgeBase'));

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/day-tracker/*" element={
      <Suspense fallback={<LoadingSpinner />}>
        <DayTracker />
      </Suspense>
    } />
    <Route path="/knowledge-base/*" element={
      <Suspense fallback={<LoadingSpinner />}>
        <KnowledgeBase />
      </Suspense>
    } />
  </Routes>
);
```

## 🎨 Design System

### Theme Configuration

The application uses Fluent UI's theming system with custom tokens:

```typescript
export const customTheme = {
  colorBrandBackground: '#0078d4',
  colorBrandForeground: '#ffffff',
  colorNeutralBackground1: '#ffffff',
  colorNeutralBackground2: '#f5f5f5',
  // ... more theme tokens
};
```

### Component Library

All components are documented and follow consistent patterns:

- TypeScript interfaces for all props
- Accessibility-first design
- Responsive behavior
- Consistent styling with Fluent UI tokens

## 📱 Mobile-First Design

The application is optimized for mobile devices with:

- **Bottom Tab Navigation** for easy thumb navigation
- **Touch-friendly interactions** with appropriate touch targets
- **Responsive layouts** that adapt to different screen sizes
- **Gesture support** for swipe actions and drag-and-drop
- **Offline capabilities** for core functionality

## 🔧 API Integration

### Service Layer

```typescript
// API service abstraction
class TaskService {
  private apiClient: ApiClient;

  async getTasks(boardId: string): Promise<Task[]> {
    const response = await this.apiClient.get<Task[]>(
      `/tasks?boardId=${boardId}`
    );
    return response.data;
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await this.apiClient.post<Task>('/tasks', taskData);
    return response.data;
  }
}
```

### React Query Integration

```typescript
// Custom hooks for server state
export const useTasks = (boardId: string) => {
  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getTasksByBoard(boardId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: newTask => {
      queryClient.invalidateQueries({ queryKey: ['tasks', newTask.boardId] });
    },
  });
};
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Jest with React Testing Library for component testing
- **Integration Tests**: Testing component interactions and API integration
- **Accessibility Tests**: Automated accessibility testing with jest-axe

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    completed: false,
  };

  it('renders task title correctly', () => {
    render(<TaskItem task={mockTask} onToggle={jest.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn();
    render(<TaskItem task={mockTask} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
```

## 🚀 Performance Optimization

### Code Splitting

- Route-based code splitting for each module
- Component-based lazy loading for heavy components
- Dynamic imports for utilities and libraries

### Bundle Optimization

- Tree shaking to eliminate unused code
- Asset optimization with Vite
- Compression and minification for production builds

### Runtime Performance

- React.memo for expensive components
- useMemo and useCallback for expensive calculations
- Virtual scrolling for large lists
- Image lazy loading and optimization

## 🔒 Security

### Client-Side Security

- Input sanitization for user-generated content
- XSS protection with proper escaping
- Secure token storage (httpOnly cookies recommended)
- Content Security Policy (CSP) headers

### Authentication

```typescript
// Protected route wrapper
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## 📚 Documentation

- [Component Library](../docs/components/) - Detailed component documentation
- [Best Practices](../docs/BEST_PRACTICES.md) - Development guidelines and standards
- [Architecture](../docs/ARCHITECTURE.md) - System architecture overview

## 🤝 Contributing

1. Follow the established component structure and naming conventions
2. Write comprehensive TypeScript types for all props and data
3. Include unit tests for new components and features
4. Ensure accessibility compliance (WCAG 2.1 AA)
5. Update documentation for significant changes

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names
- Write self-documenting code with appropriate comments

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**

   ```bash
   # Clear cache and reinstall dependencies
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **TypeScript Errors**

   ```bash
   # Run type checking
   npm run type-check
   ```

3. **Development Server Issues**
   ```bash
   # Check if port 5173 is available
   npx kill-port 5173
   npm run dev
   ```

For more detailed troubleshooting, see the [main project documentation](../README.md).

---

**LifeLog Frontend** - A modern, responsive interface for comprehensive life organization.
