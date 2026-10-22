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

| Variable       | Required | Description                                               |
| -------------- | -------- | --------------------------------------------------------- |
| `DATABASE_URL` | Yes      | MongoDB connection string                                 |
| `Server_Port`  | Yes      | Port for Express server (min: 1000, default: 3001)        |
| `CLIENT_URL`   | Yes      | Allowed frontend origin for CORS with credentials         |
| `NODE_ENV`     | Yes      | `development` or `production`                             |
| `JWT`          | Yes      | Secret key for signing and verifying JWTs (min: 10 chars) |

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

### 🗺️ Master API Endpoints Directory

| Category             | Method          | Endpoint Route(s)                               | Required Role                    | Summary                                                               |
| -------------------- | --------------- | ----------------------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| **Auth**             | `POST`          | `/auth/register`                                | Public                           | Register new user account (default role: `user`)                      |
| **Auth**             | `POST`          | `/auth/login`                                   | Public                           | Authenticate user & issue `accessToken` cookie                        |
| **Auth**             | `POST`          | `/auth/logout`                                  | Optional                         | Clear `accessToken` cookie (`Path=/`)                                 |
| **User Profile**     | `GET`           | `/user/profile`                                 | Authenticated (`user` / `admin`) | Retrieve authenticated user's profile                                 |
| **User Profile**     | `PATCH` / `PUT` | `/user/profile`                                 | Authenticated (`user` / `admin`) | Update authenticated user's name & interests                          |
| **Notes CRUD**       | `POST`          | `/notes` _(alias: `/note`)_                     | Authenticated (`user` / `admin`) | Create a new note (author set from verified token)                    |
| **Notes CRUD**       | `GET`           | `/notes` _(aliases: `/note`, `/notes/search`, `/note/search`)_ | Authenticated (`user` / `admin`) | List & search notes by title (case-insensitive title search; User: own; Admin: all) |
| **Notes CRUD**       | `GET`           | `/notes/:id` _(alias: `/note/:id`)_             | Authenticated (`user` / `admin`) | Get single note by ID (User: own; Admin: any)                         |
| **Notes CRUD**       | `PATCH` / `PUT` | `/notes/:id` _(alias: `/note/:id`)_             | Authenticated (`user` / `admin`) | Update note title / content (User: own; Admin: any)                   |
| **Notes CRUD**       | `DELETE`        | `/notes/:id` _(alias: `/note/:id`)_             | Authenticated (`user` / `admin`) | Soft-delete note (User: own; Admin: any)                              |
| **Aggregations**     | `GET`           | `/user/interests` _(alias: `/users/interests`)_ | Authenticated (`user` / `admin`) | **Scenario 1**: Group active users by interests using native pipeline |
| **Aggregations**     | `GET`           | `/user/:id/notes` _(alias: `/notes/user/:id`)_  | Authenticated (Own / Admin)      | **Scenario 2**: Retrieve user's notes via `$lookup` with pagination   |
| **Admin Management** | `GET`           | `/user` _(aliases: `/users`, `/user/filter`, `/users/filter`)_ | Admin Only (`role: "admin"`)     | List & filter users (paginated, role filter, case-insensitive search by name/email) |
| **Admin Management** | `POST`          | `/user` _(alias: `/users`)_                     | Admin Only (`role: "admin"`)     | Create a new user with specified role                                 |
| **Admin Management** | `GET`           | `/user/:id` _(alias: `/users/:id`)_             | Admin Only (`role: "admin"`)     | Retrieve individual user record by ID                                 |
| **Admin Management** | `PATCH` / `PUT` | `/user/:id` _(alias: `/users/:id`)_             | Admin Only (`role: "admin"`)     | Update user fields (`name`, `role`, `interests`)                      |
| **Admin Management** | `DELETE`        | `/user/:id` _(alias: `/users/:id`)_             | Admin Only (`role: "admin"`)     | Soft-delete user & cascade soft-delete their authored notes           |

---

### 📑 Table of Contents

1. [Authentication Endpoints (`/auth/*`)](#1-authentication-endpoints)
   - [Register User](#a-register-user)
   - [User Login](#b-user-login)
   - [User Logout](#c-user-logout)
2. [User Profile Endpoints (`/user/profile`)](#2-user-profile-endpoints)
   - [Get Authenticated Profile](#a-get-authenticated-profile)
   - [Update Authenticated Profile](#b-update-authenticated-profile)
3. [Notes Endpoints (`/notes/*` and `/note/*`)](#3-notes-endpoints)
   - [Create a Note](#a-create-a-note)
   - [Get & Search Notes (Paginated, Title Search)](#b-get--search-notes-paginated-title-search)
   - [Get Single Note](#c-get-single-note)
   - [Update a Note](#d-update-a-note)
   - [Delete a Note](#e-delete-a-note)
4. [MongoDB Aggregation Endpoints](#4-mongodb-aggregation-endpoints)
   - [Scenario 1: Group Users by Interests (`GET /user/interests`)](#a-group-users-by-interests-aggregation-scenario-1)
   - [Scenario 2: Retrieve User Notes via `$lookup` (`GET /user/:id/notes`)](#b-retrieve-users-notes-via-lookup-aggregation-scenario-2)
5. [Admin User Management Endpoints (`/user/*` and `/users/*`)](#5-admin-user-management-endpoints)
   - [List & Filter Users (Paginated, Role Filter, Search)](#a-list--filter-users-paginated-role-filter-search)
   - [Create User with Role](#b-create-user)
   - [Get User by ID](#c-get-user-by-id)
   - [Update User](#d-update-user)
   - [Delete User (Cascading Soft-Delete)](#e-delete-user)
6. [Complete API Summary Table](#6-complete-api-summary-table)

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
  _Allowed `interests` values: `"chess" | "coding" | "swimming" | "reading"`_
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

### 3. Notes Endpoints

All notes endpoints require authentication via the `accessToken` cookie.

- **Regular Users**: Can perform full CRUD operations exclusively on notes they own.
- **Administrators**: Inherit cross-user access to view everyone's notes, inspect any note, moderate/update notes, and delete notes belonging to any user.

#### A. Create a Note

Creates a new note automatically associated with the authenticated user.

- **Route**: `/notes` (or `/note`)
- **Method**: `POST`
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Request Body**:

  ```json
  {
    "title": "Architecture Overview",
    "content": "Detailed overview of the note-taking application architecture."
  }
  ```

  _Validation: `title` (3-50 chars), `content` (min 10 chars). Client-supplied `author` or internal IDs are rejected._

- **Response (`201 Created`)**:

  ```json
  {
    "status": true,
    "message": "Note created successfully",
    "data": {
      "_id": "6717600f8a846f499b95145b",
      "title": "Architecture Overview",
      "content": "Detailed overview of the note-taking application architecture.",
      "author": "6717540f8a846f499b95143a",
      "createdAt": "2026-10-22T04:53:48.117Z",
      "updatedAt": "2026-10-22T04:53:48.117Z"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Validation failure (title < 3 or > 50 chars, content < 10 chars, or unexpected disallowed fields like `author`).
  - `401 Unauthorized`: Missing or invalid authentication cookie.

---

#### B. Get & Search Notes (Paginated, Title Search)

Retrieves a paginated list of notes sorted deterministically by newest first (`createdAt: -1, _id: -1`), with optional case-insensitive title keyword search for both regular users and administrators on the **same endpoint**.

- **Regular Users**: Searches and returns only notes authored by the current user. Scoping to own notes is strictly enforced server-side (cannot bypass via query params).
- **Administrators**: Searches across notes of all users system-wide, with optional author scoping (`?author=<userId>`).

- **Route**: `/notes` (or `/note`, `/notes/search`, `/note/search`)
- **Method**: `GET`
- **Authentication**: Required (`accessToken` cookie)
- **Query Parameters**:
  - `page` (optional, integer, min 1, default: `1`): Page number for pagination.
  - `limit` (optional, integer, min 1, max 100, default: `10`): Number of notes per page.
  - `title` (optional, string): Case-insensitive keyword search matching against note `title`. Special regex characters are safely escaped to prevent regex injection.
  - `searchQ` (optional, string): Alias for `title` search query.
  - `search` (optional, string): Alternative query alias for title search.
  - `author` (optional, admin only, valid MongoDB ObjectId string): Filter notes by a specific author. Ignored for regular users.
- **Request Headers**:

  ```http
  Cookie: accessToken=<jwt_token>
  ```

##### Query Examples

1. **Standard Paginated Notes**:
   ```http
   GET /notes?page=1&limit=10
   ```

2. **Case-Insensitive Title Search (Regular User or Admin)**:
   ```http
   GET /notes?title=architecture
   ```
   Matches "Architecture Overview", "ARCHITECTURE PLAN", or any note whose title contains "architecture" (User: within own notes; Admin: system-wide).

3. **Title Search via `searchQ`**:
   ```http
   GET /notes?searchQ=meeting
   ```

4. **Admin Title Search Scoped to Specific Author**:
   ```http
   GET /notes?author=6717540f8a846f499b95143a&title=roadmap&page=1&limit=10
   ```

5. **Search Endpoint Alias**:
   ```http
   GET /notes/search?title=design
   ```

- **Response (`200 OK`)**:

  ```json
  {
    "status": true,
    "message": "Notes retrieved successfully",
    "data": [
      {
        "_id": "6717600f8a846f499b95145b",
        "title": "Architecture Overview",
        "content": "Detailed overview of the note-taking application architecture.",
        "author": "6717540f8a846f499b95143a",
        "createdAt": "2026-10-22T04:53:48.117Z",
        "updatedAt": "2026-10-22T04:53:48.117Z"
      }
    ],
    "pagination": {
      "totalData": 1,
      "totalPage": 1,
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: Invalid pagination parameters (e.g., `page=0` or `limit=101`) or invalid `author` ObjectId format.
  - `401 Unauthorized`: Missing or invalid authentication cookie.

---

#### C. Get Single Note

Retrieves an individual note. Regular users can only access their own notes; administrators can access notes belonging to any user.

- **Route**: `/notes/:id` (or `/note/:id`)
- **Method**: `GET`
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Response (`200 OK`)**:

  ```json
  {
    "status": true,
    "message": "Note retrieved successfully",
    "data": {
      "_id": "6717600f8a846f499b95145b",
      "title": "Architecture Overview",
      "content": "Detailed overview of the note-taking application architecture.",
      "author": "6717540f8a846f499b95143a",
      "createdAt": "2026-10-22T04:53:48.117Z",
      "updatedAt": "2026-10-22T04:53:48.117Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed or invalid ObjectId.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `404 Not Found`: Note does not exist, was soft-deleted, or belongs to another user (for non-admins).

---

#### D. Update a Note

Updates permitted fields (`title`, `content`). Regular users can update only their own notes; administrators can update notes belonging to any user.

- **Route**: `/notes/:id` (or `/note/:id`)
- **Method**: `PATCH` (or `PUT`)
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Request Body**:
  ```json
  {
    "title": "Updated Architecture Overview",
    "content": "Updated content with additional system architecture action items."
  }
  ```
  _Validation: Permitted fields are `title` and/or `content`. Protected fields like `author`, `_id`, or `isDeleted` are rejected._
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Note updated successfully",
    "data": {
      "_id": "6717600f8a846f499b95145b",
      "title": "Updated Architecture Overview",
      "content": "Updated content with additional system architecture action items.",
      "author": "6717540f8a846f499b95143a",
      "createdAt": "2026-10-22T04:53:48.117Z",
      "updatedAt": "2026-10-22T04:55:10.456Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Disallowed fields included, validation failure, or empty body.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `404 Not Found`: Note does not exist, was soft-deleted, or does not belong to the user (for non-admins).

---

#### E. Delete a Note

Soft-deletes a note (`isDeleted: true`). Regular users can delete only their own notes; administrators can delete notes belonging to any user.

- **Route**: `/notes/:id` (or `/note/:id`)
- **Method**: `DELETE`
- **Authentication**: Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Note deleted successfully",
    "data": null
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed or invalid ObjectId.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `404 Not Found`: Note does not exist, was already deleted, or does not belong to the user (for non-admins).

---

### 4. MongoDB Aggregation Endpoints

#### A. Group Users by Interests (Aggregation Scenario 1)

Groups active users by their interests using a single native MongoDB aggregation pipeline with `$unwind`, deduplication via `$addToSet`, sensitive field masking, and alphabetical sorting.

- **Route**: `/user/interests` (or `/users/interests`)
- **Method**: `GET`
- **Authentication**: Required (`accessToken` cookie, all authenticated users)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Request Body**: None
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Users grouped by interests retrieved successfully",
    "data": [
      {
        "interest": "chess",
        "count": 2,
        "users": [
          {
            "_id": "6717540f8a846f499b95143a",
            "name": "Alice Smith",
            "email": "alice@example.com"
          },
          {
            "_id": "6717540f8a846f499b95143b",
            "name": "Bob Jones",
            "email": "bob@example.com"
          }
        ]
      },
      {
        "interest": "coding",
        "count": 3,
        "users": [
          {
            "_id": "6717540f8a846f499b95143a",
            "name": "Alice Smith",
            "email": "alice@example.com"
          }
        ]
      }
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication cookie.

---

#### B. Retrieve User's Notes via Lookup (Aggregation Scenario 2)

Retrieves a specified user's notes using a single MongoDB aggregation pipeline with a `$lookup` stage targeting the existing `notes` collection.

- **Regular Users**: Can retrieve only their own notes (`403 Forbidden` if querying another user's ID).
- **Administrators**: Can query any user's ID to retrieve their notes.

- **Route**: `/user/:id/notes` (or `/notes/user/:id`)
- **Method**: `GET`
- **Authentication**: Required (`accessToken` cookie)
- **URL Parameters**:
  - `id`: Target user MongoDB ObjectId
- **Query Parameters**:
  - `page` (optional, integer, min 1, default: `1`)
  - `limit` (optional, integer, min 1, max 100, default: `10`)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_token>
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User notes retrieved successfully via lookup",
    "data": {
      "user": {
        "_id": "6717540f8a846f499b95143a",
        "name": "Alice Smith",
        "email": "alice@example.com"
      },
      "notes": [
        {
          "_id": "6717600f8a846f499b95145b",
          "title": "Meeting Notes",
          "content": "Discuss quarterly goals and architecture roadmap.",
          "author": "6717540f8a846f499b95143a",
          "createdAt": "2026-10-22T04:53:48.117Z",
          "updatedAt": "2026-10-22T04:53:48.117Z"
        }
      ]
    },
    "pagination": {
      "totalData": 1,
      "totalPage": 1,
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed ObjectId or invalid pagination parameters.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Regular user attempting to inspect another user's notes.
  - `404 Not Found`: Target user does not exist or has been deleted.

---

### 5. Admin User Management Endpoints

All admin endpoints require an authenticated user with `role: "admin"` verified via the `accessToken` cookie.

#### A. List & Filter Users (Paginated, Role Filter, Search)

Retrieves a paginated list of active users, with optional filtering by role and case-insensitive keyword search matching user `name` or `email`. Users are sorted deterministically by newest first (`createdAt: -1, _id: -1`). Passwords and internal flags are omitted.

- **Route**: `/user` (or `/users`, `/user/filter`, `/users/filter`)
- **Method**: `GET`
- **Authentication**: Admin Required (`accessToken` cookie)
- **Query Parameters**:
  - `page` (optional, integer, min 1, default: `1`): Page number for pagination.
  - `limit` (optional, integer, min 1, max 100, default: `10`): Number of users per page.
  - `role` (optional, string: `"admin"`, `"user"`, or `"all"`): Filter by user role. Case-insensitive (e.g. `role=admin`). When omitted or set to `"all"`, all user roles are included.
  - `searchQ` (optional, string): Case-insensitive search query matching against `name` OR `email`. Special regex characters are safely escaped to prevent regex injection.
  - `search` (optional, string): Alias for `searchQ`.
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_admin_token>
  ```

##### Query Examples

1. **Standard Paginated List**:
   ```http
   GET /users?page=1&limit=10
   ```

2. **Filter by Role**:
   ```http
   GET /users?role=admin
   ```

3. **Case-Insensitive Search by Name or Email**:
   ```http
   GET /users?searchQ=alice
   ```
   Matches "Alice Smith", "ALICE", or "alice@example.com".

4. **Combined Role Filter and Search Query (Dedicated Filter Route)**:
   ```http
   GET /user/filter?role=user&searchQ=gmail.com&page=1&limit=10
   ```

- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "_id": "6717540f8a846f499b95143a",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "role": "user",
        "interests": ["chess", "coding"],
        "createdAt": "2026-10-22T04:37:35.123Z",
        "updatedAt": "2026-10-22T04:37:35.123Z"
      }
    ],
    "pagination": {
      "totalData": 1,
      "totalPage": 1,
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid pagination parameters or invalid role filter (`role` must be 'admin', 'user', or 'all').
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Access forbidden (user is not an admin).

---

#### B. Create User

Enables an administrator to provision a new user with an explicit role (`"user"` or `"admin"`). Passwords are automatically hashed with bcrypt.

- **Route**: `/user` (or `/users`)
- **Method**: `POST`
- **Authentication**: Admin Required (`accessToken` cookie)
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_admin_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Jane Admin",
    "email": "jane.admin@example.com",
    "password": "Password123!",
    "role": "admin",
    "interests": ["coding", "reading"]
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "status": true,
    "message": "User created successfully",
    "data": {
      "_id": "6717700f8a846f499b95147c",
      "name": "Jane Admin",
      "email": "jane.admin@example.com",
      "role": "admin",
      "interests": ["coding", "reading"],
      "createdAt": "2026-10-22T05:10:20.123Z",
      "updatedAt": "2026-10-22T05:10:20.123Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (name < 3 chars, invalid email, password < 6 chars, invalid role).
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Access forbidden (user is not an admin).
  - `409 Conflict`: Email is already registered.

---

#### C. Get User by ID

Retrieves an individual user record by their unique ID.

- **Route**: `/user/:id` (or `/users/:id`)
- **Method**: `GET`
- **Authentication**: Admin Required (`accessToken` cookie)
- **URL Parameters**:
  - `id`: Target user MongoDB ObjectId
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_admin_token>
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User retrieved successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "user",
      "interests": ["chess", "coding"],
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T04:37:35.123Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed or invalid ObjectId.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Access forbidden (user is not an admin).
  - `404 Not Found`: User not found or deleted.

---

#### D. Update User

Updates permitted fields (`name`, `role`, `interests`) of a user. Disallows direct modification of passwords or internal flags.

- **Route**: `/user/:id` (or `/users/:id`)
- **Method**: `PATCH` (or `PUT`)
- **Authentication**: Admin Required (`accessToken` cookie)
- **URL Parameters**:
  - `id`: Target user MongoDB ObjectId
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_admin_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Alice Cooper",
    "role": "admin",
    "interests": ["swimming", "reading"]
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User updated successfully",
    "data": {
      "_id": "6717540f8a846f499b95143a",
      "name": "Alice Cooper",
      "email": "alice@example.com",
      "role": "admin",
      "interests": ["swimming", "reading"],
      "createdAt": "2026-10-22T04:37:35.123Z",
      "updatedAt": "2026-10-22T05:15:45.678Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Disallowed fields included (e.g. `password`, `_id`), validation failure, or empty update payload.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Access forbidden (user is not an admin).
  - `404 Not Found`: User not found or deleted.

---

#### E. Delete User

Soft-deletes a user (`isDeleted: true`). To maintain data integrity and prevent orphaned records, **all notes authored by the deleted user are also automatically soft-deleted**.

- **Route**: `/user/:id` (or `/users/:id`)
- **Method**: `DELETE`
- **Authentication**: Admin Required (`accessToken` cookie)
- **URL Parameters**:
  - `id`: Target user MongoDB ObjectId
- **Request Headers**:
  ```http
  Cookie: accessToken=<jwt_admin_token>
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": true,
    "message": "User deleted successfully",
    "data": null
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed or invalid ObjectId.
  - `401 Unauthorized`: Missing or invalid authentication cookie.
  - `403 Forbidden`: Access forbidden (user is not an admin).
  - `404 Not Found`: User not found or already deleted.

---

### 6. Complete API Summary Table

| Method          | Route                                     | Access                      | Request Body / Query                                 | Description                                          |
| --------------- | ----------------------------------------- | --------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `POST`          | `/auth/register`                          | Public                      | Body: `{ name, email, password }`                    | Register a new user account                          |
| `POST`          | `/auth/login`                             | Public                      | Body: `{ email, password }`                          | Authenticate and receive `accessToken` cookie        |
| `POST`          | `/auth/logout`                            | Optional                    | None                                                 | Clear `accessToken` cookie (`Path=/`)                |
| `GET`           | `/user/profile`                           | Authenticated               | None                                                 | Retrieve authenticated user profile                  |
| `PATCH` / `PUT` | `/user/profile`                           | Authenticated               | Body: `{ name?, interests? }`                        | Update authenticated user profile                    |
| `GET`           | `/user/interests` (or `/users/interests`) | Authenticated               | None                                                 | **Aggregation 1**: Group users by interests          |
| `GET`           | `/user/:id/notes`                         | Authenticated (Own / Admin) | Query: `?page=1&limit=10`                            | **Aggregation 2**: Retrieve user notes via `$lookup` |
| `GET`           | `/notes/user/:id`                         | Authenticated (Own / Admin) | Query: `?page=1&limit=10`                            | Alias for `$lookup` user notes retrieval             |
| `GET`           | `/user` (or `/users`, `/user/filter`, `/users/filter`) | Admin Only                  | Query: `?page=1&limit=10&role=user&searchQ=alice`    | List & filter users (role filter, case-insensitive search by name/email) |
| `POST`          | `/user` (or `/users`)                     | Admin Only                  | Body: `{ name, email, password, role?, interests? }` | Admin creates user with specified role               |
| `GET`           | `/user/:id` (or `/users/:id`)             | Admin Only                  | None                                                 | Retrieve user by ID                                  |
| `PATCH` / `PUT` | `/user/:id` (or `/users/:id`)             | Admin Only                  | Body: `{ name?, role?, interests? }`                 | Admin updates user fields                            |
| `DELETE`        | `/user/:id` (or `/users/:id`)             | Admin Only                  | None                                                 | Soft-delete user & cascade delete their notes        |
| `POST`          | `/notes` (or `/note`)                     | Authenticated               | Body: `{ title, content }`                           | Create a new note                                    |
| `GET`           | `/notes` (or `/note`, `/notes/search`, `/note/search`) | Authenticated               | Query: `?page=1&limit=10&title=work` (`&author=` for admin) | Get & search notes by title (case-insensitive; User: own; Admin: all) |
| `GET`           | `/notes/:id` (or `/note/:id`)             | Authenticated (Own / Admin) | None                                                 | Get single note by ID                                |
| `PATCH` / `PUT` | `/notes/:id` (or `/note/:id`)             | Authenticated (Own / Admin) | Body: `{ title?, content? }`                         | Update note title and/or content                     |
| `DELETE`        | `/notes/:id` (or `/note/:id`)             | Authenticated (Own / Admin) | None                                                 | Soft-delete a note                                   |
