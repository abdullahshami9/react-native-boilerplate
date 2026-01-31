# System Architecture Documentation

This document defines the structural and behavioral architecture of the **Raabtaa** ecosystem. It is intended to guide the "What" and "Why" of the system, distinct from the coding rules in `project_rules.md`.

## 1. Business Architecture
**Goal**: A unified marketplace connecting Businesses and Individuals for Products and Services.
- **core Entities**:
  - **Super App Identity**: `Users` can be Consumers, Service Providers, or Business Sellers seamlessly.
  - **Marketplace**: Dual-stream commerce:
    1.  **Products**: Inventory-based, Cart flow, Orders (Pending -> Completed).
    2.  **Services**: Time-based, Booking/Appointments (Calendar slots).
- **Key Flows**:
  - **Discovery**: Search-driven discovery of people, products, and services (Discover Screen).
  - **Connection**: Social networking feature (Follow/Connect) to build trust graphs.
  - **Procurement**: Business-to-Business (B2B) supply chain management features (Procurement Summary).

## 2. Application Architecture
**Pattern**: Client-Server (Monolithic Backend, Fat Client Frontend).
- **Mobile Client**:
  - **Framework**: React Native (Expo/CLI).
  - **Pattern**: Component-based, Hook-driven logic (`DataService.ts` abstraction layer).
  - **Navigation**: Stack + Tab Navigation (React Navigation).
- **Backend Service**:
  - **Runtime**: Node.js.
  - **Framework**: Express.js.
  - **Pattern**: Route-Controller-Service (Currently Routes calling DB directly, moving towards separation).

## 3. Data Architecture
- **Store**: MySQL (Relational Data).
- **Key Schemas**:
  - `users`: Central identity (RBAC via `user_type`).
  - `products` / `services`: Catalog items.
  - `orders` / `appointments`: Transactional records.
  - `connections`: Social graph (Follower/Following).
- **Integration**: Direct SQL queries via `dbQuery` wrapper.

## 4. Security Architecture
- **Authentication**: JWT (JSON Web Tokens).
  - Issued on Login/Biometric Auth.
  - Validated via `verifyToken` middleware.
- **Authorization**: Resource-level checks (e.g., `req.user.id == resource.user_id`).
- **Data Protection**:
  - **Inputs**: Parameterized queries to prevent SQL Injection.
  - **Transport**: HTTPS (Production) / Tunneling (Dev).

## 5. Network Architecture
- **Communication Protocol**: REST over HTTP/1.1.
- **Endpoints**: Structured REST API (`/api/resource/:id`).
- **Connectivity**:
  - Local Development: Localhost via ADB Reverse or Tunneled URL.
  - Production: Cloud-hosted API (Gateway).

## 6. Deployment Architecture
- **Current State (Dev)**:
  - **Database**: Local MySQL instance.
  - **Backend**: Local Node process (`npm start`).
  - **Frontend**: Metro Bundler -> Android Emulator / Physical Device.
- **Target State (Prod)**:
  - **Mobile**: App Store / Play Store bundles (.aab/.ipa).
  - **Backend**: Containerized (Docker) on Cloud Provider (AWS/Azure).
  - **Database**: Managed SQL Service (RDS/Cloud SQL).
