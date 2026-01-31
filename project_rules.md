# Project Rules & Guidelines

This file serves as the single source of truth for coding standards, architectural patterns, and workflow rules for the **Raabtaa** project (MobileApp).

For high-level business logic, entity relationships, and system design, refer to **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

**⚠️ CRITICAL: Review this file and ARCHITECTURE.md before creating any new plan or writing code.**

## 1. Technological Stack & Architecture
- **Frontend**: React Native (TypeScript).
- **Backend**: Node.js with Express.
- **Database**: MySQL (accessed via `dbQuery` wrapper).
- **State Management**: React Context (`AuthContext` for global user state) & Local State.
- **Navigation**: React Navigation.

## 2. Frontend Guidelines (MobileApp)

### 2.1 UI/UX & Theming
- **Premium Aesthetic**: All designs MUST look premium, modern, and "wow" the user. Avoid basic/default stylings. Use spacing, typography, and rounded corners effectively.
- **Theming**:
  - **NEVER** hardcode colors (e.g., `#000`, `#FFF`).
  - **ALWAYS** use the `useTheme()` hook and values from the `theme` object (e.g., `theme.bg`, `theme.text`, `theme.cardBg`).
  - **Dark Mode**: All screens must fully support Dark Mode. Test visibility of text (especially on input fields and cards) in both modes.
- **Components**:
  - Use `CustomAlert` for in-app notifications/confirmations instead of native `Alert.alert`.
  - Use `PageWrapper` or standard layout containers to ensure safe area handling.

### 2.2 Image Handling
- **Resolution**: **ALWAYS** use the `resolveImage` helper from `src/utils/ImageHelper.ts` for ANY dynamic image source.
  - Syntax: `resolveImage(url || defaultString)`
  - **Do NOT** pass the default as a second argument to `resolveImage`. Use the logical OR `||`.
- **Defaults**: **ALWAYS** use `getDefaultImageForType(type, subtype)` to fetch fallback images. Do not hardcode placeholder URLs.
- **Asset Schema**: The app uses a custom `asset:` schema (e.g., `asset:business_finance`) for local assets. Ensure logic handles this string format correctly.

### 2.3 Data Fetching
- **Service Layer**: All API calls must go through `src/services/DataService.ts`. **Do NOT** use `axios` directly in components.
- **Error Handling**: gracefully handle `success: false` responses. Use try/catch blocks in components.

## 3. Backend Guidelines (server.js)

### 3.1 Routing & API Structure
- **Route Ordering**: **CRITICAL**. Define specific routes (e.g., `/api/services/discover`) **BEFORE** parameterized generic routes (e.g., `/api/services/:userId`) to prevent collision.
- **Response Format**: All APIs must return a standard JSON structure:
  ```json
  {
      "success": true,
      "data": [], // or specific key like "services", "products"
      "message": "Optional success/error message"
  }
  ```
- **Error Handling**: Return HTTP 500 for server errors with `{ success: false }`.

### 3.2 Database Interactions
- **Query Wrapper**: **ALWAYS** use the `dbQuery` wrapper function.
- **Security**: **ALWAYS** use parameterized queries (`?` syntax) to prevent SQL Injection. Never interpolate strings directly into SQL commands.

### 3.3 Authentication
- **Middleware**: Use `verifyToken` middleware for any protected route.
- **Authorization**: Ensure users can only modify their own data (check `req.user.id` against resource owner).

## 4. Workflow Rules
1.  **Analyze First**: Before writing code, analyze existing patterns in related files (e.g., check `ShopScreen` before building `DiscoverScreen`).
2.  **Verify UI**: After making UI changes, verify Dark Mode compatibility.
3.  **Verify Logic**: If adding a new API endpoint, ensure it doesn't conflict with existing wildcards.
4.  **Clean Code**: Remove debug logs (`console.log`) before finalizing a task.
