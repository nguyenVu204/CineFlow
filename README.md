# Cinema Booking Microservices Demo

This project is a lightweight cinema booking platform built as an intern-friendly .NET 8 microservices sample. It includes:

- Movie Service
- Cinema Service
- Booking Service
- Identity Service (ASP.NET Core Identity + JWT)
- YARP API Gateway
- React front-end
- SQL Server, Redis and RabbitMQ infrastructure

## Architecture overview

```text
React Frontend -> API Gateway -> Identity / Movie / Cinema / Booking Services
                                     |      |          |
                                     SQL Server  SQL Server  SQL Server
                                     |      |          |
                                     Redis / RabbitMQ
```

## Tech stack

- ASP.NET Core Web API (.NET 8) with Identity and JWT bearer authentication
- Entity Framework Core + SQL Server
- Redis distributed lock
- RabbitMQ with outbox pattern
- YARP API Gateway
- React + TypeScript + Vite
- Docker Compose

## Features

- Browse movies with search and filtering
- View cinemas and screens
- Create and view showtimes; Cinema Service provisions the matching Booking seat rows
- Select seats from the live showtime availability endpoint
- Hold seats with 5-minute expiry
- Confirm booking with idempotency key support
- Cancel booking and release seats
- View a booking receipt and demo customer's booking history
- Manage movie CRUD and create cinemas, screens, seats and showtimes in the development admin page
- Race-condition protection using Redis + SQL rowversion
- RabbitMQ event publishing for booking confirmations

## Seat concurrency

```text
User A -> Acquire seat lock
User B -> Acquire seat lock

User A -> Check seat state -> Status = Available -> Held
User B -> Check seat state -> finds seat already Held -> 409 Conflict
```

The flow uses:

- Redis distributed lock for short-lived critical section
- SQL Server transaction for consistent update
- `RowVersion` optimistic concurrency to guard against stale writes

## Run locally

### 1. Restore .NET dependencies

```bash
dotnet restore CinemaBooking.sln
```

### 2. Start infrastructure from Docker Compose

Create a local environment file and set strong, unique values for the SQL Server password, JWT signing key, and internal service key before starting the containers. Optionally provide bootstrap administrator credentials:

```bash
cp .env.example .env
# Edit .env; configure SQL_SA_PASSWORD, JWT_SECRET, INTERNAL_API_KEY, and optional bootstrap-admin values.
docker compose up -d
```

Do not commit `.env`. Compose requires `SQL_SA_PASSWORD` and reads it for both SQL Server and the service connection strings. The default host ports are deliberately separate from the usual local development ports and SQL Server:

| Component | Local / Docker host port |
|---|---:|
| API Gateway | 5100 |
| Movie API | 5101 |
| Cinema API | 5102 |
| Booking API | 5103 |
| Identity API | 5104 |
| Local Vite frontend | 5173 |
| Docker frontend | 5174 |
| SQL Server | 15433 |
| RabbitMQ management UI | 15673 |
| RabbitMQ AMQP | 15674 |
| Redis | 16379 |

Compose exposes these ports on the host while containers continue to communicate over the internal ports/service names (`sqlserver:1433`, `redis:6379`, `rabbitmq:5672`, and APIs on `:8080`). If a listed host port is already taken, change its corresponding value in `.env`; do not change the internal container ports.

The Compose services use SQL authentication and the `sqlserver` container hostname. All APIs use the same JWT signing key, issuer (`CineFlow.Identity`) and audience (`CineFlow.Api`); the signing key must be at least 32 UTF-8 bytes. Cinema-to-Booking seat initialization also requires a shared internal service key of at least 32 UTF-8 bytes. For running APIs directly on Windows, the Identity, Movie, Cinema, and Booking projects share a .NET User Secrets ID. Set the JWT key once and the internal service key for Cinema and Booking once from PowerShell; keep both values out of tracked files:

```powershell
$secretsId = "CineFlow.LocalDevelopment"
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$jwtBytes = New-Object byte[] 48
$internalApiBytes = New-Object byte[] 48
$rng.GetBytes($jwtBytes)
$rng.GetBytes($internalApiBytes)
$jwtSecret = [Convert]::ToBase64String($jwtBytes)
$internalApiKey = [Convert]::ToBase64String($internalApiBytes)
dotnet user-secrets set "Jwt:SigningKey" $jwtSecret --id $secretsId
dotnet user-secrets set "InternalService:ApiKey" $internalApiKey --id $secretsId
$rng.Dispose()
```

These secrets are stored in your user profile and are loaded automatically in the `Development` environment by all four APIs. For running the APIs directly on Windows with a local SQL Server instance, the appsettings files use Windows Authentication:

```text
Server=.;Database=MovieDb;Trusted_Connection=True;TrustServerCertificate=True;
Server=.;Database=CinemaDb;Trusted_Connection=True;TrustServerCertificate=True;
Server=.;Database=BookingDb;Trusted_Connection=True;TrustServerCertificate=True;
Server=.;Database=IdentityDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Each API creates its own database and seed data on first startup. SQL Server must be running, and the Windows account running the API must be allowed to create databases. Redis and RabbitMQ are still required by the Booking Service.

### 3. Start backend services

```bash
dotnet run --project src/Services/Movie/Movie.API

dotnet run --project src/Services/Cinema/Cinema.API

dotnet run --project src/Services/Booking/Booking.API

dotnet run --project src/Services/Identity/Identity.API

dotnet run --project src/Gateway/ApiGateway
```

### 4. Start frontend

```bash
cd frontend/cinema-booking-client
npm install
npm run dev
```

Then open:

- Local frontend (`npm run dev`): http://localhost:5173
- Docker frontend: http://localhost:5174
- Gateway: http://localhost:5100
- Combined Swagger UI: http://localhost:5100/swagger
- Identity API Swagger: http://localhost:5104/swagger
- Movie API Swagger: http://localhost:5101/swagger
- Cinema API Swagger: http://localhost:5102/swagger
- Booking API Swagger: http://localhost:5103/swagger
- RabbitMQ UI: http://localhost:15673

The frontend uses the Vite development proxy for `/api` requests, so the browser only talks to the frontend origin. By default the proxy targets `http://localhost:5100`. Docker Compose overrides `VITE_API_PROXY_TARGET` to use `http://api-gateway:8080` inside the Compose network.

### Frontend demo flow

1. Browse and search movies on `/` or `/movies`.
2. Open a movie, choose a cinema showtime, and select available seats.
3. Hold seats for five minutes; the seat map refreshes from Booking Service and shows a countdown.
4. Use **Thanh toán giả lập** to confirm the booking and view its receipt.
5. Open `/my-bookings` to see bookings for the signed-in account.
6. Sign in as an administrator to use `/admin` to manage movies, cinemas, screens, seats, and showtimes or query bookings by Identity user ID.

New registrations receive the `Customer` role. To provision the first `Admin`, configure both `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before first startup; alternatively, an existing Admin can assign the `Admin` role through the Identity API. Public registration cannot choose roles.

## Default database values

Local Windows runs use the integrated SQL Server connection strings above. Docker Compose overrides them with SQL authentication for the SQL Server container.
## Demo accounts and flow

Register or sign in at `/account`; the frontend keeps the access token for the current browser session and sends it as a Bearer token.

## API overview

Identity service:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (authenticated)
- GET /api/auth/users (Admin only)
- PUT /api/auth/users/{userId}/roles (Admin only; roles are `Customer` and `Admin`)

Movie service:

- GET /api/movies
- GET /api/movies/{id}
- POST /api/movies
- PUT /api/movies/{id}
- DELETE /api/movies/{id}

Cinema service:

- GET /api/cinemas
- GET /api/cinemas/{id}
- POST /api/cinemas
- PUT /api/cinemas/{id}
- DELETE /api/cinemas/{id}
- GET /api/screens/{id}
- POST /api/screens
- PUT /api/screens/{id}
- GET /api/screens/{screenId}/seats
- POST /api/seats
- GET /api/showtimes
- GET /api/showtimes/{id}
- POST /api/showtimes
- PUT /api/showtimes/{id}

Booking service:

- GET /api/bookings?userId={identityUserId} (Admin only; results capped at 500)
- GET /api/bookings/my-bookings (authenticated account only)
- GET /api/bookings/showtimes/{showtimeId}/seats
- POST /api/bookings/hold
- GET /api/bookings/{id}
- GET /api/bookings/my-bookings?userId={userId}
- POST /api/bookings/{id}/confirm
- POST /api/bookings/{id}/cancel

Movie and Cinema reads remain public; their create/update/delete operations require the `Admin` role. Booking operations require a valid JWT and are restricted to the booking owner, except Admins may access bookings. Public seat availability remains readable. Showtime-seat initialization is protected by the shared internal service key and is not a user-facing endpoint.

Confirmation accepts an optional `Idempotency-Key` header. Repeating the same key for the same booking returns the original JSON response; reusing it for a different booking returns `409 Conflict`.

Booking state changes and outbox records are committed in the same SQL transaction. The outbox worker publishes durable `BookingConfirmed` and `SeatReleased` messages to RabbitMQ. Seat holds use short-lived Redis locks and SQL Server `rowversion`; the hold itself expires after five minutes.

Creating a showtime through Cinema Service sends that screen's seat IDs to Booking Service. Seat provisioning is idempotent; if Booking Service is unavailable, the showtime remains created and the API returns `503` with its ID so seat provisioning can be retried.

## Important notes

- This is an educational project, not a production-grade distributed system.
- Each service owns its own SQL database.
- The project intentionally keeps the design simple to remain easy to understand and demo.
- Identity stores account and role data in its own `IdentityDb`; user IDs are taken from the validated JWT subject, never from booking request bodies.
- Access tokens expire after 60 minutes. Refresh tokens and email verification are not implemented; configure HTTPS and secret rotation before production use.

## Future improvements

- Add more robust seat map and admin dashboard
- Add SignalR live seat updates
- Add proper payment integration
