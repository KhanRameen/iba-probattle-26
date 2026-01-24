# 🏘️ Neighbourly — Stage 1: Neighborhood Pilot MVP

**PROBATTLE26 — Web Development Case Study Challenge**

Neighbourly is a hyper-local community marketplace designed to connect neighbors for skill-sharing, tool rentals, tutoring, and specialized local services.

This repository implements **Stage 1: Neighborhood Pilot**, focusing on **role-based access, core functionality, and domain correctness** in a single-community environment.

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
