# Paalmall 


## Project Structure

```
paalmall/
├── .github/workflows/      # CI/CD workflows
├── public/                 # Static assets
├── src/
│   ├── app/               # Redux store configuration
│   ├── assets/            # Images, icons, fonts
│   ├── components/        # Reusable components
│   ├── features/          # Feature modules (Redux slices)
│   ├── pages/             # Route-level pages (lazy loaded)
│   ├── services/          # API layer with Axios
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Global TypeScript types
│   ├── constants/         # Application constants
│   ├── config/            # Configuration files
│   ├── router/            # Routing configuration
│   ├── theme/             # MUI theme customization
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
└── tests/                 # Test files
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:coverage` - Generate coverage report



## Path Aliases

```typescript
import { Button } from '@components/common/Button';
import { authService } from '@services';
import { useDebounce } from '@hooks';
```

## License

Private and proprietary.
