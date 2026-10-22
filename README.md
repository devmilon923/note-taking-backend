# Note Taking App - Backend API

A robust, TypeScript-based REST API built with Express 5, MongoDB (Mongoose), Zod validation, and secure cookie-based JWT authentication.

---

## 🚀 Project Setup Guide

### 1. Prerequisites
- **Node.js**: v18 or later (v20+ recommended)
- **npm**: v9 or later
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URL

---

### 2. Installation

1. Navigate to the server directory:
   ```bash
   cd Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

### 3. Environment Variables Configuration

Create a `.env` file in the root of the `Server` directory based on `.env.sample`:

```bash
cp .env.sample .env
```

Fill in the environment variables:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>
Server_Port=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
JWT=your_super_secret_jwt_key_at_least_10_characters
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `Server_Port` | Yes | Port for Express server (min: 1000, default: 3001) |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS with credentials |
| `NODE_ENV` | Yes | `development` or `production` |
| `JWT` | Yes | Secret key for signing and verifying JWTs (min: 10 chars) |

---

### 4. Running the Server

#### Development Mode (with hot-reload)
```bash
npm run dev
```
The server will start at: `http://localhost:3001` (or your configured `Server_Port`).

#### Production Build & Run
```bash
npm run build
npm start
```

---

## 🔒 Authentication Flow Overview

- **Authentication Method**: JWT stored in an `httpOnly`, `sameSite`, and `secure` (in production) cookie named `accessToken`.
- **Credentialed CORS**: The API requires requests from `CLIENT_URL` with credentials enabled (`withCredentials: true` in Axios / `credentials: 'include'` in Fetch).
- **Security Guardrails**:
  - Passwords hashed using `bcryptjs` (salt rounds: 10).
  - Default role `"user"` enforced server-side.
  - Strict input validation prevents mass assignment of protected fields (`role`, `password`, internal flags).
  - Passwords and sensitive internal properties are never returned in responses.

---

## 📖 API Documentation

All responses follow a consistent standard response wrapper:
- **Success**: `{ "status": true, "message": "...", "data": ... }`
- **Error**: `{ "status": false, "message": "...", "data": ... }`

---

### 1. Authentication Endpoints

#### A. Register User
Creates a new user account with default `"user"` role.

- **Route**: `/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "status": true,
    "message": "User registered successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T04:37:35.123Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (name < 3 chars, invalid email, password < 6 chars, or unexpected disallowed fields).
  - `409 Conflict`: Email is already registered.

---

#### B. User Login
Verifies user credentials and sets an `httpOnly` authentication cookie.

- **Route**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response Headers**:
  ```http
  Set-Cookie: accessToken=<jwt_token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User logged in successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T04:37:35.123Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid email or password (anti-enumeration protection).

---

#### C. User Logout
Clears the `accessToken` authentication cookie.

- **Route**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Optional / Clears cookie unconditionally
- **Request Body**: None
- **Response Headers**:
  ```http
  Set-Cookie: accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User logged out successfully",
    "data": null
  }
  ```

---

### 2. User Profile Endpoints

#### A. Get Authenticated Profile
Retrieves the profile of the currently authenticated user identified by the verified JWT cookie.

- **Route**: `/user/profile`
- **Method**: `GET`
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Request Body**: None
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Profile retrieved successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "interests": "coding",
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T04:37:35.123Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing, expired, or invalid authentication cookie.
  - `404 Not Found`: User not found.

---

#### B. Update Authenticated Profile
Updates permitted profile fields (`name`, `interests`). Disallows modification of protected fields (`role`, `password`, `isDeleted`, `_id`).

- **Route**: `/user/profile`
- **Method**: `PATCH` (or `PUT`)
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Johnathan Doe",
    "interests": "chess"
  }
  ```
  *Allowed `interests` values: `"chess" | "coding" | "swimming" | "reading"`*
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Profile updated successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "Johnathan Doe",
      "email": "john@example.com",
      "role": "user",
      "interests": "chess",
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T04:45:12.789Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Disallowed fields included (e.g., trying to set `role: "admin"` or `password`), invalid enum value for `interests`, or empty update body.
  - `401 Unauthorized`: Missing or invalid authentication cookie.

---

### 3. Summary Table

| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | None | `{ name, email, password }` | Register new user account |
| `POST` | `/auth/login` | None | `{ email, password }` | Authenticate user & set cookie |
| `POST` | `/auth/logout` | Optional | None | Clear authentication cookie |
| `GET` | `/user/profile` | Cookie | None | Get current user's profile |
| `PATCH` / `PUT` | `/user/profile` | Cookie | `{ name?, interests? }` | Update permitted profile fields |
