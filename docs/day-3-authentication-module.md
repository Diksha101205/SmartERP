# SmartERP Day 3 - Authentication Module

## 1. Day 3 Objective

Day 3 adds the authentication foundation for SmartERP so future company, ledger, stock, and voucher APIs can be protected.

Deliverables:

- User registration endpoint
- User login endpoint
- JWT token generation
- Password hashing with bcrypt
- Auth middleware for protected routes
- Current user endpoint
- Protected company routes

## 2. Authentication Flow

### Register

Endpoint:

```text
POST /api/auth/register
```

Request:

```json
{
  "name": "Diksha",
  "email": "diksha@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Diksha",
      "email": "diksha@example.com",
      "createdAt": "2026-06-24T..."
    },
    "token": "jwt-token"
  }
}
```

### Login

Endpoint:

```text
POST /api/auth/login
```

Request:

```json
{
  "email": "diksha@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Diksha",
      "email": "diksha@example.com",
      "createdAt": "2026-06-24T..."
    },
    "token": "jwt-token"
  }
}
```

### Current User

Endpoint:

```text
GET /api/auth/me
```

Header:

```text
Authorization: Bearer jwt-token
```

## 3. Security Rules Added

- Passwords are hashed using bcrypt before storage.
- Login response never returns `password_hash`.
- Duplicate user email registration returns `409`.
- Invalid login returns a generic error message.
- JWT is signed using `JWT_SECRET`.
- Protected routes require `Authorization: Bearer <token>`.

## 4. Environment Variables

Add these values to `backend/.env`:

```env
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1d
```

`JWT_SECRET` must be at least 32 characters.

## 5. Protected Routes

The company API now uses auth middleware:

```text
GET /api/companies
POST /api/companies
```

This means company setup is ready to become user-scoped on the next development day.

## 6. Recommended Day 4

Day 4 should connect authentication to company ownership:

- Create company for authenticated user
- Insert `user_companies` owner record
- Limit each owner to five companies
- List only companies accessible to the logged-in user
- Add active company selection API
