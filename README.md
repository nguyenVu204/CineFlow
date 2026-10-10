# Cinema Booking Microservices Demo

This project is a lightweight cinema booking platform built as an intern-friendly .NET 8 microservices sample. It includes:

- Movie Service
- Cinema Service
- Booking Service
- YARP API Gateway
- React front-end
- SQL Server, Redis and RabbitMQ infrastructure

## Architecture overview

```text
React Frontend -> API Gateway -> Movie / Cinema / Booking Services
                                     |      |          |
                                     SQL Server  SQL Server  SQL Server
                                     |      |          |
                                     Redis / RabbitMQ
```

## Tech stack

- ASP.NET Core Web API (.NET 8)
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
- Hold seats with 5-minute expiry
- Confirm booking with idempotency key support
- Cancel booking and release seats
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

Create a local environment file and set a strong SQL Server password before starting the containers:

```bash
cp .env.example .env
# Edit .env and replace the SQL Server password placeholder.
docker compose up -d
```

Do not commit `.env`. Compose requires `SQL_SA_PASSWORD` and reads it for both SQL Server and the service connection strings. If port 1433 is already used by a local SQL Server, set `SQLSERVER_PORT=1434` in `.env`; containers continue to communicate with `sqlserver:1433` internally.

The Compose services use SQL authentication and the `sqlserver` container hostname. For running the APIs directly on Windows with a local SQL Server instance, the appsettings files instead use Windows Authentication:

```text
Server=.;Database=MovieDb;Trusted_Connection=True;TrustServerCertificate=True;
Server=.;Database=CinemaDb;Trusted_Connection=True;TrustServerCertificate=True;
Server=.;Database=BookingDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Each API creates its own database and seed data on first startup. SQL Server must be running, and the Windows account running the API must be allowed to create databases. Redis and RabbitMQ are still required by the Booking Service.

### 3. Start backend services

```bash
dotnet run --project src/Services/Movie/Movie.API

dotnet run --project src/Services/Cinema/Cinema.API

dotnet run --project src/Services/Booking/Booking.API

dotnet run --project src/Gateway/ApiGateway
```

### 4. Start frontend

```bash
cd frontend/cinema-booking-client
npm install
npm run dev
```

Then open:

- Frontend: http://localhost:5173
- Gateway: http://localhost:5000
- Combined Swagger UI: http://localhost:5000/swagger
- Movie API Swagger: http://localhost:5001/swagger
- Cinema API Swagger: http://localhost:5002/swagger
- Booking API Swagger: http://localhost:5003/swagger
- RabbitMQ UI: http://localhost:15672

## Default database values

Local Windows runs use the integrated SQL Server connection strings above. Docker Compose overrides them with SQL authentication for the SQL Server container.
## Demo accounts and flow

Example user ID:

```text
customer-1
```

Flow:

1. Open movie list
2. Pick a movie
3. Choose a showtime
4. Hold seats in Booking API
5. Confirm booking
6. Check booking history

## API overview

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

- GET /api/bookings/showtimes/{showtimeId}/seats
- POST /api/bookings/hold
- GET /api/bookings/{id}
- GET /api/bookings/my-bookings?userId={userId}
- POST /api/bookings/{id}/confirm
- POST /api/bookings/{id}/cancel

Confirmation accepts an optional `Idempotency-Key` header. Repeating the same key for the same booking returns the original JSON response; reusing it for a different booking returns `409 Conflict`.

Booking state changes and outbox records are committed in the same SQL transaction. The outbox worker publishes durable `BookingConfirmed` and `SeatReleased` messages to RabbitMQ. Seat holds use short-lived Redis locks and SQL Server `rowversion`; the hold itself expires after five minutes.

Creating a showtime through Cinema Service sends that screen's seat IDs to Booking Service. Seat provisioning is idempotent; if Booking Service is unavailable, the showtime remains created and the API returns `503` with its ID so seat provisioning can be retried.

## Important notes

- This is an educational project, not a production-grade distributed system.
- Each service owns its own SQL database.
- The project intentionally keeps the design simple to remain easy to understand and demo.
- Booking currently identifies customers by the `UserId` supplied by the caller. JWT authentication and role-based authorization remain future work.

## Future improvements

- Add JWT authentication and role-based access
- Add more robust seat map and admin dashboard
- Add SignalR live seat updates
- Add proper payment integration
