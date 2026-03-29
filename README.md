# NestJS Starter

A NestJS starter project with TypeORM database support for both PostgreSQL and MySQL.

## What is NestJS?

NestJS is a framework for building server-side Node.js applications. It uses TypeScript and combines elements from Object-Oriented Programming, Functional Programming, and Functional Reactive Programming.

Think of it as Angular for the backend - it provides structure, organization, and powerful features out of the box.

## Core Concepts

### 1. Modules

Modules are the basic building blocks of a NestJS application. Every app has at least one module - the root module (`AppModule`).

```typescript
@Module({
  imports: [DatabaseModule, UsersModule],  // Other modules this module depends on
  controllers: [AppController],             // Controllers that handle HTTP requests
  providers: [AppService],                  // Services that contain business logic
})
export class AppModule {}
```

**Key points:**
- Modules organize your code into cohesive blocks
- Each feature should have its own module (e.g., `UsersModule`, `AuthModule`)
- The `@Module()` decorator provides metadata that NestJS uses to organize the application

### 2. Controllers

Controllers handle incoming HTTP requests and return responses. They're like the "routes" of your application.

```typescript
@Controller('users')  // Base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()              // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')         // GET /users/:id
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()             // POST /users
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }
}
```

**Common decorators:**
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP methods
- `@Param('id')` - Extract route parameters
- `@Body()` - Extract request body
- `@Query()` - Extract query string parameters

### 3. Services (Providers)

Services contain your business logic. They're injected into controllers using Dependency Injection.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }
}
```

**Key points:**
- `@Injectable()` marks a class as a provider that can be injected
- Services are where you put database operations, business rules, external API calls, etc.
- Controllers should be thin - they just receive requests and delegate to services

### 4. Dependency Injection (DI)

NestJS has a built-in DI container. When you add a parameter to a constructor, NestJS automatically injects an instance.

```typescript
// NestJS sees this constructor and automatically provides an instance of UsersService
constructor(private readonly usersService: UsersService) {}
```

**Why DI matters:**
- Makes testing easier (you can inject mock services)
- Loose coupling between classes
- NestJS manages the lifecycle of objects for you

## Project Structure

```
src/
├── main.ts                 # Entry point - bootstraps the application
├── app.module.ts           # Root module
├── app.controller.ts       # Root controller (handles /, /health)
├── app.service.ts          # Root service
│
├── auth/                   # Authentication module
│   ├── auth.module.ts      # Main auth module (conditional loading)
│   ├── common/             # Shared auth code
│   │   ├── decorators/     # @Public(), @CurrentUser()
│   │   ├── dto/            # LoginDto
│   │   └── interfaces/     # AuthUser, AuthResult
│   ├── jwt/                # JWT authentication (removable)
│   │   ├── jwt-auth.module.ts
│   │   ├── jwt-auth.controller.ts
│   │   ├── jwt-auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt.strategy.ts
│   └── session/            # Session authentication (removable)
│       ├── session-auth.module.ts
│       ├── session-auth.controller.ts
│       ├── session-auth.service.ts
│       ├── session-auth.guard.ts
│       ├── local.strategy.ts
│       └── session.serializer.ts
│
├── database/
│   ├── database.module.ts  # Database configuration with TypeORM
│   ├── data-source.ts      # TypeORM CLI configuration (for migrations)
│   └── migrations/         # Database migration files
│
└── users/
    ├── users.module.ts     # Users feature module
    ├── users.controller.ts # Handles /users routes
    ├── users.service.ts    # User business logic
    └── entities/
        └── user.entity.ts  # User database entity/model
```

## How the Database Works

### TypeORM

TypeORM is an ORM (Object-Relational Mapper) that lets you work with databases using TypeScript classes instead of raw SQL.

### Entities

Entities are classes that map to database tables:

```typescript
@Entity('users')  // Table name
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Database Configuration

The database is configured in `src/database/database.module.ts`. It reads from environment variables:

```env
DB_TYPE=postgres          # 'postgres' or 'mysql'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nest_starter
DB_SYNCHRONIZE=true       # Auto-sync schema (dev only!)
DB_LOGGING=true           # Log SQL queries
```

**Switching databases:** Just change `DB_TYPE` and `DB_PORT` in `.env`:
- PostgreSQL: `DB_TYPE=postgres`, `DB_PORT=5432`
- MySQL: `DB_TYPE=mysql`, `DB_PORT=3306`

## Authentication

This starter includes a dual authentication system supporting both **JWT** and **Session-based** auth. You can easily switch between them or remove one entirely.

### Configuration

Set the auth type in `.env`:

```env
AUTH_TYPE=jwt                    # Options: 'jwt' or 'session'

# JWT Settings (used when AUTH_TYPE=jwt)
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Session Settings (used when AUTH_TYPE=session)
SESSION_SECRET=your-session-secret
SESSION_MAX_AGE=86400000         # 24 hours in ms
```

### How It Works

**All routes are protected by default.** Use the `@Public()` decorator to make routes accessible without authentication:

```typescript
import { Public } from './auth/common/decorators';

@Controller('products')
export class ProductsController {
  @Public()
  @Get()
  findAll() {
    // Accessible without authentication
  }

  @Get(':id')
  findOne() {
    // Requires authentication
  }
}
```

### Getting the Current User

Use the `@CurrentUser()` decorator to access the authenticated user:

```typescript
import { CurrentUser } from './auth/common/decorators';
import { AuthUser } from './auth/common/interfaces';

@Get('profile')
getProfile(@CurrentUser() user: AuthUser) {
  return user;
}

// Or get a specific property
@Get('my-email')
getEmail(@CurrentUser('email') email: string) {
  return { email };
}
```

### JWT Authentication

When `AUTH_TYPE=jwt`, the system uses stateless JWT tokens:

- **Login**: `POST /auth/login` returns `accessToken` and `refreshToken`
- **Refresh**: `POST /auth/refresh` with `refreshToken` in body
- **Logout**: `POST /auth/logout` (client discards tokens)
- **Protected routes**: Include `Authorization: Bearer <token>` header

### Session Authentication

When `AUTH_TYPE=session`, the system uses server-side sessions with cookies:

- **Login**: `POST /auth/login` creates a session and sets a cookie
- **Logout**: `POST /auth/logout` destroys the session
- **Protected routes**: Cookie is sent automatically by the browser

### Removing an Auth Strategy

**To use only JWT:**
1. Delete `src/auth/session/` folder
2. Set `AUTH_TYPE=jwt` in `.env`
3. Run `npm uninstall passport-local express-session @types/passport-local @types/express-session`

**To use only Sessions:**
1. Delete `src/auth/jwt/` folder
2. Set `AUTH_TYPE=session` in `.env`
3. Run `npm uninstall @nestjs/jwt passport-jwt @types/passport-jwt`

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL or MySQL database

### Installation

```bash
npm install
```

### Database Setup

1. Create the database:
   ```bash
   # PostgreSQL
   createdb nest_starter

   # MySQL
   mysql -u root -p -e "CREATE DATABASE nest_starter;"
   ```

2. Update `.env` with your database credentials

### Running the App

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The app runs on `http://localhost:8001` (configured via `PORT` in `.env`).

## API Endpoints

### App Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns "Hello World!" |
| GET | `/health` | Health check with timestamp |

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email/password | Public |
| POST | `/auth/refresh` | Refresh access token (JWT only) | Public |
| POST | `/auth/logout` | Logout user | Protected |

### User Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a new user |

### Example Requests

```bash
# Health check (public)
curl http://localhost:8001/health

# Create a user (protected - requires auth)
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secret123"}'

# Login (public)
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'

# Response:
# {
#   "user": { "id": "...", "email": "john@example.com", "name": "John Doe" },
#   "accessToken": "eyJhbG...",
#   "refreshToken": "eyJhbG...",
#   "expiresIn": 900
# }

# Access protected route with token
curl http://localhost:8001/users \
  -H "Authorization: Bearer eyJhbG..."

# Refresh token
curl -X POST http://localhost:8001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbG..."}'
```

## Database Migrations

Migrations are version-controlled database schema changes. Use them in production instead of `DB_SYNCHRONIZE=true`.

```bash
# Generate a migration from entity changes
npm run migration:generate src/database/migrations/CreateUsersTable

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Request Lifecycle

Here's what happens when a request hits your NestJS app:

```
HTTP Request
     │
     ▼
┌─────────────┐
│  Middleware │  (logging, auth checks, etc.)
└─────────────┘
     │
     ▼
┌─────────────┐
│   Guards    │  (authorization)
└─────────────┘
     │
     ▼
┌─────────────┐
│ Interceptors│  (transform request/response)
└─────────────┘
     │
     ▼
┌─────────────┐
│   Pipes     │  (validation, transformation)
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │  (route handler)
└─────────────┘
     │
     ▼
┌─────────────┐
│   Service   │  (business logic)
└─────────────┘
     │
     ▼
┌─────────────┐
│  Database   │  (via TypeORM)
└─────────────┘
```

## Common Commands

```bash
npm run start:dev    # Start with hot reload
npm run build        # Compile TypeScript
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npm run format       # Format code with Prettier
```

## Next Steps

Once you're comfortable with the basics, explore:

1. **Role-Based Access Control** - Add roles to users and create role guards
2. **Interceptors** - Transform responses, add logging
3. **Exception Filters** - Handle errors gracefully
4. **Rate Limiting** - Protect your API from abuse
5. **Swagger/OpenAPI** - Auto-generate API documentation

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [NestJS Discord](https://discord.gg/nestjs)
