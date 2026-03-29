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
├── app.controller.ts       # Root controller (handles /, /health, /greet, /echo)
├── app.service.ts          # Root service
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

### App Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns "Hello World!" |
| GET | `/health` | Health check with timestamp |
| GET | `/greet/:name` | Returns greeting with name |
| POST | `/echo` | Echoes back JSON body |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a new user |

### Example Requests

```bash
# Create a user
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secret"}'

# Get all users
curl http://localhost:8001/users

# Health check
curl http://localhost:8001/health
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

1. **Validation** - Use `class-validator` with DTOs to validate request data
2. **Guards** - Implement authentication/authorization
3. **Interceptors** - Transform responses, add logging
4. **Pipes** - Transform and validate input data
5. **Exception Filters** - Handle errors gracefully

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [NestJS Discord](https://discord.gg/nestjs)
