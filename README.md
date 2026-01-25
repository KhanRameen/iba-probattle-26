# 🏘️ Neighbourly — Neighborhood Pilot MVP

**PROBATTLE26 — Web Development Case Study Challenge**

Neighbourly is a hyper-local community marketplace designed to connect neighbors for skill-sharing, tool rentals, tutoring, and specialized local services.

This repository implements **Stage 1: Neighborhood Pilot**, focusing on **role-based access, core functionality, and domain correctness** in a single-community environment.

---

# Stage 2 - Provider & Seeker Features Implementation

In **Stage 2**, I implemented the full backend and frontend functionality for both **Providers** and **Seekers**, including service creation, booking, ratings, filtering, neighborhood-based radius search, and caching with Redis. All core features are now live and working with RBAC (Role-Based Access Control).

---

## Features Implemented

### 1. Provider Dashboard

- Providers can **create services** with:
  - `title`, `description`, `price`, and **type** (`SERVICE`, `SKILL`, `TOOL`)
  - Select **neighborhood** from a list fetched via API
- **View all their services** with live bookings attached
- **View bookings** for their services with seeker info
- **Rate bookings** made by seekers
- RBAC ensures only `PROVIDER` users can access this dashboard

**UI snippet:**

```
Create New Service:
[Title] [Description] [Price] [Type Selector] [Neighborhood Selector] [Create Button]

Your Services:

Service 1 | $100 | Type: SERVICE

Service 2 | $50 | Type: SKILL

Bookings:

SeekerName booked Service1 - Status: PENDING [Rate Buttons 1-5]
```

### 2. Seeker Features

- Seekers can **browse services** with multiple filters:
  - Type, Category, Min/Max Price
  - **Radius filter** visualized as H3 hexagons around the user

  ⬡ ⬡ ⬡
  ⬡ ⬡ ⬡ ⬡ ⬡
  ⬡ ⬡ USER ⬡ ⬡
  ⬡ ⬡ ⬡ ⬡
  ⬡ ⬡
  - Services include provider name, price, description, and any ratings

- **RBAC enforced**: only `SEEKER` users can access filtered service listings

---

### 3. Backend

- **Prisma** models for `User`, `Service`, `Booking`, `Neighborhood`
- **RBAC checks** using `requireRole` middleware
- **Redis caching** for GET `/services`:
  - Cached per user and query params
  - 60-second TTL for fast repeated queries
- Neighborhood and radius search implemented with **H3 grid**:
  - `radiusKmToH3Steps` maps kilometers to H3 steps
- Full validation of service creation:
  - Required fields: `title`, `description`, `price`, `type`, `neighborhood`
  - Enum validation for `type` (`SERVICE` | `SKILL` | `TOOL`)
  - Providers must have assigned neighborhood or select one during service creation

---

### 4. Frontend

- **React / Next.js 13** with `use client` for dynamic dashboards
- **Provider Dashboard**:
  - Fetches services & bookings on load
  - Create services via POST API
  - Rate bookings inline
- **Seeker Page**:
  - Dynamic filters for type, category, price, radius
  - Services displayed with provider info and ratings
- **All APIs integrated** with proper headers, POST bodies, and error handling
- **Redis caching** for services list ensures fast response and reduced DB load

---

### 5. APIs Implemented

| API                      | Method | Role     | Description                                 |
| ------------------------ | ------ | -------- | ------------------------------------------- |
| `/api/provider/services` | GET    | PROVIDER | Get all provider’s services                 |
| `/api/provider/services` | POST   | PROVIDER | Create new service with type & neighborhood |
| `/api/provider/bookings` | GET    | PROVIDER | Get bookings for provider services          |
| `/api/bookings/:id/rate` | POST   | PROVIDER | Rate a booking                              |
| `/api/services`          | GET    | SEEKER   | Get filtered services with radius & caching |
| `/api/neighborhoods`     | GET    | ALL      | Get all neighborhoods for select input      |

---

### 6. Caching & Optimization

- **Redis** implemented in `GET /services` route
- Cache key includes:
  - User ID, type, category, min/max price, radius
- Cache invalidation to be added on service creation/update in Stage 3

---

### 7. Workflow Diagram (ASCII)

```
Provider → Service → Bookings → Rating
+---------+ +---------+ +---------+ +---------+
| Provider|→ | Service |→ | Booking |→ | Rating |
+---------+ +---------+ +---------+ +---------+
```

### Stage 2 Completion Summary

All major flows are functional:

- Provider can **create services**, **view bookings**, and **rate**
- Seeker can **browse services** with **radius and filter options**
- Redis caching implemented for **performance**
- RBAC ensures **proper access control**
- Neighborhood search fully integrated

---

## 🎯 Objective (Stage 1)

Stage 1 focuses on:

- Creating users with defined roles (`PROVIDER` or `SEEKER`)
- Allowing providers to post services
- Enabling seekers to browse and book services
- Preventing invalid actions (e.g., providers booking their own service)

This stage intentionally **ignores scale, multi-city logic, and real-time features**.

---

## 🧱 Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Frontend     | Minimal / Postman for API testing |
| Backend      | Next.js App Router (REST APIs)    |
| Database     | PostgreSQL (via Prisma ORM)       |
| ORM          | Prisma                            |
| Testing      | Postman / cURL                    |
| Architecture | Single-neighborhood MVP           |

---

## 🗂️ Project Structure

```bash
src/
├── app/
│ └── api/
│ ├── users/
│ │ └── route.ts # User creation
│ ├── services/
│ │ └── route.ts # Service CRUD
│ └── bookings/
│ └── route.ts # Booking creation
├── lib/
│ └── prisma.ts # Prisma client
prisma/
└── schema.prisma # Database schema
```

## 🧩 Data Model

### User

- `id`: UUID
- `name`: string
- `email`: string
- `password`: string
- `role`: `PROVIDER | SEEKER`
- `createdAt`: timestamp

### Service

- `id`: UUID
- `title`: string
- `description`: string
- `price`: number
- `providerId`: UUID (foreign key to User)
- `createdAt`: timestamp

### Booking

- `id`: UUID
- `serviceId`: UUID (foreign key to Service)
- `seekerId`: UUID (foreign key to User)
- `status`: string (`PENDING`)
- `createdAt`: timestamp

---

## 🔐 Role Design

- Users are strictly separated into **Providers** and **Seekers** using a database enum:

```prisma
enum Role {
  PROVIDER
  SEEKER
}
```

## API Endpoints & cURL Examples

### Create Users

- ### Provider:

```
curl --location 'http://localhost:3000/api/users' \
--header 'Content-Type: multipart/form-data' \
--form 'name="rameen"' \
--form 'email="test@mail"' \
--form 'password="password"' \
--form 'role="PROVIDER"'
```

Output:

```
{
  "id": "8eb5bcd4-64ce-455c-9337-3a9603d205dd",
  "name": "rameen",
  "email": "test@mail",
  "password": "password",
  "role": "PROVIDER",
  "createdAt": "2026-01-24T10:27:23.853Z"
}
```

- ### Seeker:

```
curl --location 'http://localhost:3000/api/users' \
--form 'name="Kinza"' \
--form 'email="test2@mail"' \
--form 'password="password"' \
--form 'role="SEEKER"'
```

Output:

```
{
  "id": "b085c2e4-5e25-4b30-b709-08c2ebeacf81",
  "name": "Kinza",
  "email": "test2@mail",
  "password": "password",
  "role": "SEEKER",
  "createdAt": "2026-01-24T10:31:41.728Z"
}
```

## Create Service (Provider only)

```
curl --location 'http://localhost:3000/api/services' \
--header 'Content-Type: application/json' \
--data '{
    "title":"local tutoring",
    "description": "description",
    "price":"500",
    "providerId":"8eb5bcd4-64ce-455c-9337-3a9603d205dd"
}'
```

Output:

```
{
  "id": "56d1e2d2-fde8-4cb1-9390-373db915ff76",
  "title": "local tutoring",
  "description": "description",
  "price": 500,
  "providerId": "8eb5bcd4-64ce-455c-9337-3a9603d205dd",
  "createdAt": "2026-01-24T10:36:42.884Z"
}
```

## List All Services

```
curl --location 'http://localhost:3000/api/services'
```

output:

```
[
  {
    "id": "56d1e2d2-fde8-4cb1-9390-373db915ff76",
    "title": "local tutoring",
    "description": "description",
    "price": 500,
    "provider": {
      "id": "8eb5bcd4-64ce-455c-9337-3a9603d205dd",
      "name": "rameen"
    },
    "createdAt": "2026-01-24T10:36:42.884Z"
  }
]

```

## Booking Validation — Provider Cannot Book Own Service

```
curl --location 'http://localhost:3000/api/bookings' \
--header 'Content-Type: application/json' \
--data '{
    "serviceId":"56d1e2d2-fde8-4cb1-9390-373db915ff76",
    "seekerId":"8eb5bcd4-64ce-455c-9337-3a9603d205dd"
}'
```

Output:

```
{
  "error": "You cannot book your own service"
}
```

## Booking — Seeker Can Book

```
curl --location 'http://localhost:3000/api/bookings' \
--header 'Content-Type: application/json' \
--data '{
    "serviceId":"56d1e2d2-fde8-4cb1-9390-373db915ff76",
    "seekerId":"b085c2e4-5e25-4b30-b709-08c2ebeacf81"
}'
```

Output:

```
{
  "id": "d53657b5-0f88-4d29-a91c-dccefa47b4d6",
  "serviceId": "56d1e2d2-fde8-4cb1-9390-373db915ff76",
  "seekerId": "b085c2e4-5e25-4b30-b709-08c2ebeacf81",
  "status": "PENDING",
  "createdAt": "2026-01-24T10:41:00.980Z"
}
```
