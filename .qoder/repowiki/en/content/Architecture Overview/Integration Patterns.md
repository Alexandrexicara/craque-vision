# Integration Patterns

<cite>
**Referenced Files in This Document**
- [server.js](file://backend/server.js)
- [database.js](file://backend/config/database.js)
- [cloudinary.js](file://backend/config/cloudinary.js)
- [upload.js](file://backend/config/upload.js)
- [schema.sql](file://database/schema.sql)
- [auth.middleware.js](file://backend/middleware/auth.middleware.js)
- [subscription.middleware.js](file://backend/middleware/subscription.middleware.js)
- [payment.controller.js](file://backend/controllers/payment.controller.js)
- [video.controller.js](file://backend/controllers/video.controller.js)
- [upload.routes.js](file://backend/routes/upload.routes.js)
- [video.routes.js](file://backend/routes/video.routes.js)
- [video.model.js](file://backend/models/video.model.js)
- [subscription.model.js](file://backend/models/subscription.model.js)
- [athlete.model.js](file://backend/models/athlete.model.js)
- [like.model.js](file://backend/models/like.model.js)
- [package.json](file://backend/package.json)
- [UploadVideo.jsx](file://frontend/src/pages/UploadVideo.jsx)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive Cloudinary integration documentation with video upload workflow
- Documented the new upload routes and Cloudinary configuration patterns
- Updated video controller documentation to reflect Cloudinary integration
- Added frontend integration patterns for video upload process
- Enhanced error handling and retry strategies for Cloudinary uploads
- Documented the complete video upload pipeline from frontend to Cloudinary

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the integration patterns implemented in Craque-Vision's backend for external services and data persistence. It focuses on:
- Adapter-style abstraction for external services (Cloudinary and MercadoPago) via configuration and controller orchestration
- Comprehensive Cloudinary integration for video storage, processing, and thumbnail generation
- Payment processing flow with mock endpoints and subscription persistence
- PostgreSQL integration with connection pooling, query patterns, indexing, and triggers
- Authentication middleware and authorization guards
- Webhook handling, asynchronous processing, and service-to-service communication patterns

Where applicable, the document references concrete source files and highlights how the codebase implements robust error handling, retry strategies, and scalability considerations.

## Project Structure
The backend follows a layered architecture:
- Entry point initializes Express, loads environment variables, registers routes, and starts the server
- Routes define HTTP endpoints and apply middleware for authentication and authorization
- Controllers implement business logic and coordinate model operations
- Models encapsulate database queries and expose static methods for CRUD operations
- Middleware enforces authentication and authorization policies
- Configuration defines the PostgreSQL connection pool and Cloudinary integration
- Frontend provides comprehensive video upload interface with payment processing

```mermaid
graph TB
Client["Client"]
Server["Express Server<br/>server.js"]
AuthMW["Auth Middleware<br/>auth.middleware.js"]
UploadRoutes["Upload Routes<br/>upload.routes.js"]
VideoRoutes["Video Routes<br/>video.routes.js"]
UploadCtrl["Upload Controller<br/>upload.routes.js"]
VideoCtrl["Video Controller<br/>video.controller.js"]
Controllers["Controllers<br/>payment.controller.js<br/>video.controller.js"]
Models["Models & Queries<br/>video.model.js<br/>subscription.model.js<br/>athlete.model.js<br/>like.model.js"]
DB["PostgreSQL Pool<br/>database.js"]
Cloudinary["Cloudinary Integration<br/>cloudinary.js"]
ExtCloud["External: Cloudinary<br/>cloudinary:*"]
ExtMP["External: MercadoPago<br/>mercadopago:*"]
Client --> Server
Server --> UploadRoutes
Server --> VideoRoutes
UploadRoutes --> AuthMW
VideoRoutes --> AuthMW
UploadRoutes --> UploadCtrl
VideoRoutes --> VideoCtrl
UploadCtrl --> Cloudinary
UploadCtrl -. "buffer streaming" .-> ExtCloud
Controllers --> Models
Models --> DB
Controllers -. "mock integrations" .-> ExtCloud
Controllers -. "mock integrations" .-> ExtMP
```

**Diagram sources**
- [server.js:1-66](file://backend/server.js#L1-L66)
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [upload.routes.js:1-131](file://backend/routes/upload.routes.js#L1-L131)
- [video.routes.js:1-23](file://backend/routes/video.routes.js#L1-L23)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [video.controller.js:1-168](file://backend/controllers/video.controller.js#L1-L168)
- [video.model.js:1-78](file://backend/models/video.model.js#L1-L78)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [athlete.model.js:1-119](file://backend/models/athlete.model.js#L1-L119)
- [like.model.js:1-61](file://backend/models/like.model.js#L1-L61)
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [package.json:10-20](file://backend/package.json#L10-L20)

**Section sources**
- [server.js:1-66](file://backend/server.js#L1-L66)
- [package.json:10-20](file://backend/package.json#L10-L20)

## Core Components
- PostgreSQL connection pool configured via environment variables and exported for reuse across models
- Cloudinary integration configured through environment variables or URL configuration
- Upload routes handle file validation, buffering, and Cloudinary streaming
- Payment controller orchestrates video and subscription purchase flows with mock endpoints
- Video controller coordinates athlete-specific video operations and integrates with likes
- Models encapsulate SQL queries, joins, and aggregations with parameterized statements
- Authentication middleware validates JWT tokens and enriches requests with user context
- Authorization middleware restricts endpoints to permitted user types

Key integration touchpoints:
- External service adapters: Cloudinary and MercadoPago are declared as dependencies and used in controllers to demonstrate adapter-style integration
- Cloudinary upload pipeline: Buffer-based streaming to Cloudinary with automatic resource type detection
- Mock endpoints: Payment controller returns mock payment URLs and identifiers, enabling frontend integration while backend remains decoupled from real providers
- Database persistence: All models persist and query data through the shared pool, leveraging indexes and triggers for performance and auditability

**Section sources**
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [payment.controller.js:1-108](file://backend/controllers/payment.controller.js#L1-L108)
- [video.controller.js:1-168](file://backend/controllers/video.controller.js#L1-L168)
- [video.model.js:1-78](file://backend/models/video.model.js#L1-L78)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [package.json:10-20](file://backend/package.json#L10-L20)

## Architecture Overview
The system integrates external services and databases through a clean separation of concerns:
- Controllers act as adapters between HTTP and domain logic, invoking models and external SDKs
- Models abstract database operations and enforce data integrity
- Middleware secures endpoints and enforces role-based access
- Environment-driven configuration enables flexible deployment across environments
- Cloudinary integration provides scalable media storage and processing capabilities

```mermaid
graph TB
subgraph "HTTP Layer"
RUpload["Upload Routes<br/>upload.routes.js"]
RPay["Payment Routes<br/>payment.routes.js"]
RVid["Video Routes<br/>video.routes.js"]
CUpload["Upload Controller<br/>upload.routes.js"]
CPay["Payment Controller<br/>payment.controller.js"]
CVid["Video Controller<br/>video.controller.js"]
end
subgraph "Domain & Persistence"
MVideo["Video Model<br/>video.model.js"]
MSub["Subscription Model<br/>subscription.model.js"]
MAth["Athlete Model<br/>athlete.model.js"]
MLike["Like Model<br/>like.model.js"]
Pool["PostgreSQL Pool<br/>database.js"]
end
subgraph "Security"
MWAuth["Auth Middleware<br/>auth.middleware.js"]
MWSub["Subscription Middleware<br/>subscription.middleware.js"]
end
subgraph "External Services"
CloudConfig["Cloudinary Config<br/>cloudinary.js"]
ExtCloud["Cloudinary Adapter<br/>cloudinary:*"]
ExtMP["MercadoPago Adapter<br/>mercadopago:*"]
end
RUpload --> MWAuth
RPay --> MWAuth
RVid --> MWAuth
RVid --> MWSub
RUpload --> CUpload
RPay --> CPay
RVid --> CVid
CUpload --> CloudConfig
CloudConfig --> ExtCloud
CPay --> MSub
CPay -. "mock integrations" .-> ExtCloud
CPay -. "mock integrations" .-> ExtMP
CVid --> MVideo
CVid --> MAth
CVid --> MLike
MVideo --> Pool
MSub --> Pool
MAth --> Pool
MLike --> Pool
```

**Diagram sources**
- [upload.routes.js:1-131](file://backend/routes/upload.routes.js#L1-L131)
- [payment.routes.js:1-13](file://backend/routes/payment.routes.js#L1-L13)
- [video.routes.js:1-23](file://backend/routes/video.routes.js#L1-L23)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [payment.controller.js:1-108](file://backend/controllers/payment.controller.js#L1-L108)
- [video.controller.js:1-168](file://backend/controllers/video.controller.js#L1-L168)
- [video.model.js:1-78](file://backend/models/video.model.js#L1-L78)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [athlete.model.js:1-119](file://backend/models/athlete.model.js#L1-L119)
- [like.model.js:1-61](file://backend/models/like.model.js#L1-L61)
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [subscription.middleware.js:1-50](file://backend/middleware/subscription.middleware.js#L1-L50)
- [package.json:10-20](file://backend/package.json#L10-L20)

## Detailed Component Analysis

### Cloudinary Integration Pattern (Buffer Streaming + Resource Type Detection)
The Cloudinary integration demonstrates a sophisticated buffer streaming approach:
- Environment-based configuration supports both URL and individual credential formats
- Memory-based file upload using multer.memoryStorage for large file handling
- Custom upload helper function with Promise-based streaming to Cloudinary
- Automatic resource type detection ('auto', 'video', 'image')
- Dedicated folders for different resource types (videos, thumbnails, avatars)

```mermaid
sequenceDiagram
participant Client as "Frontend Client"
participant UploadRoute as "Upload Routes"
participant Multer as "Multer Memory Storage"
participant CloudHelper as "Upload Helper"
participant Cloudinary as "Cloudinary Service"
participant Backend as "Backend Response"
Client->>UploadRoute : POST /upload/video
UploadRoute->>Multer : Process video file
Multer->>UploadRoute : Buffer stream
UploadRoute->>CloudHelper : uploadToCloudinary(buffer, folder, 'video')
CloudHelper->>Cloudinary : uploader.upload_stream()
Cloudinary-->>CloudHelper : secure_url response
CloudHelper-->>UploadRoute : video_url
UploadRoute-->>Client : {message, video_url, filename, size}
```

**Diagram sources**
- [upload.routes.js:74-100](file://backend/routes/upload.routes.js#L74-L100)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)

**Section sources**
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [upload.routes.js:74-100](file://backend/routes/upload.routes.js#L74-L100)

### Video Upload Workflow (Complete Pipeline)
The video upload workflow encompasses multiple stages from frontend interaction to Cloudinary processing:
- Frontend validation with size limits and format restrictions
- Backend file processing with multer memory storage
- Cloudinary streaming with automatic resource type detection
- Database persistence with payment proof attachment
- Response formatting with metadata and security considerations

```mermaid
flowchart TD
Start(["Frontend Upload Form"]) --> Validate["Validate File Size & Type"]
Validate --> Upload["Send to /upload/video"]
Upload --> Buffer["Multer Memory Storage"]
Buffer --> Stream["Stream to Cloudinary"]
Stream --> CloudResponse["Receive Secure URL"]
CloudResponse --> Database["Persist Video Record"]
Database --> Success["Return Success Response"]
Error["Handle Errors"] --> CloudError["Cloudinary Error"]
CloudError --> ReturnError["Return Error Response"]
```

**Diagram sources**
- [UploadVideo.jsx:133-183](file://frontend/src/pages/UploadVideo.jsx#L133-L183)
- [upload.routes.js:74-100](file://backend/routes/upload.routes.js#L74-L100)
- [video.controller.js:15-34](file://backend/controllers/video.controller.js#L15-L34)

**Section sources**
- [upload.routes.js:1-131](file://backend/routes/upload.routes.js#L1-131)
- [UploadVideo.jsx:133-183](file://frontend/src/pages/UploadVideo.jsx#L133-L183)
- [video.controller.js:6-34](file://backend/controllers/video.controller.js#L6-L34)

### Payment Integration Pattern (Adapter + Mock Orchestration)
The payment subsystem demonstrates an adapter pattern:
- Dependencies declare Cloudinary and MercadoPago SDKs
- Controllers expose endpoints to list packages/plans, initiate purchases, and confirm payments
- Confirmation persists subscription records and returns normalized responses
- Mock payment URLs and identifiers enable frontend integration without real provider coupling

```mermaid
sequenceDiagram
participant Client as "Client"
participant Routes as "Payment Routes"
participant Ctrl as "Payment Controller"
participant Model as "Subscription Model"
participant DB as "PostgreSQL Pool"
Client->>Routes : POST /payments/video
Routes->>Ctrl : createVideoPayment()
Ctrl-->>Client : {message, package, payment_url, mock_payment_id}
Client->>Routes : POST /payments/subscription
Routes->>Ctrl : createSubscriptionPayment()
Ctrl-->>Client : {message, plan, payment_url, mock_payment_id, expires_at}
Client->>Routes : POST /payments/confirm
Routes->>Ctrl : confirmPayment()
Ctrl->>Model : create(subscriptionData)
Model->>DB : INSERT INTO subscriptions
DB-->>Model : subscription row
Model-->>Ctrl : subscription
Ctrl-->>Client : {message, subscription}
```

**Diagram sources**
- [payment.routes.js:6-10](file://backend/routes/payment.routes.js#L6-L10)
- [payment.controller.js:31-107](file://backend/controllers/payment.controller.js#L31-L107)
- [subscription.model.js:3-16](file://backend/models/subscription.model.js#L3-L16)
- [database.js:1-13](file://backend/config/database.js#L1-L13)

**Section sources**
- [package.json:12-17](file://backend/package.json#L12-L17)
- [payment.controller.js:15-107](file://backend/controllers/payment.controller.js#L15-L107)
- [payment.routes.js:6-10](file://backend/routes/payment.routes.js#L6-L10)
- [subscription.model.js:3-51](file://backend/models/subscription.model.js#L3-L51)

### Video Storage and Processing Integration (Cloudinary Adapter)
Cloudinary integration is declared as a dependency and intended to be used within controllers to upload media and derive thumbnails. The adapter pattern allows swapping providers by changing the adapter module while keeping controllers unchanged.

```mermaid
classDiagram
class UploadRoutes {
+post('/avatar')
+post('/video')
+post('/thumbnail')
}
class CloudinaryAdapter {
+upload(fileStream, options)
+generateThumbnail(publicId, options)
}
class VideoController {
+uploadVideo(req,res)
}
UploadRoutes --> CloudinaryAdapter : "uses"
VideoController --> CloudinaryAdapter : "uses"
```

**Diagram sources**
- [upload.routes.js:42-128](file://backend/routes/upload.routes.js#L42-L128)
- [video.controller.js:6-34](file://backend/controllers/video.controller.js#L6-L34)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)

**Section sources**
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [upload.routes.js:42-128](file://backend/routes/upload.routes.js#L42-L128)
- [video.controller.js:6-34](file://backend/controllers/video.controller.js#L6-L34)

### Payment Provider Integration (MercadoPago Adapter)
MercadoPago integration is declared as a dependency and intended to be used within controllers to create payment preferences and handle checkout redirects. The adapter pattern isolates provider-specific logic behind a unified interface.

```mermaid
classDiagram
class PaymentController {
+createVideoPayment(req,res)
+createSubscriptionPayment(req,res)
+confirmPayment(req,res)
}
class MercadoPagoAdapter {
+createPreference(preferenceData)
+getPaymentStatus(paymentId)
}
PaymentController --> MercadoPagoAdapter : "uses"
```

**Diagram sources**
- [payment.controller.js:31-107](file://backend/controllers/payment.controller.js#L31-L107)
- [package.json:17](file://backend/package.json#L17)

**Section sources**
- [package.json:17](file://backend/package.json#L17)
- [payment.controller.js:31-107](file://backend/controllers/payment.controller.js#L31-L107)

### Database Integration Patterns (PostgreSQL)
PostgreSQL is integrated via a connection pool configured from environment variables. Models encapsulate queries, joins, and aggregations, ensuring consistent access patterns and parameterized statements for safety.

```mermaid
erDiagram
USERS {
serial id PK
varchar name
varchar email UK
varchar password
varchar user_type
boolean email_verified
boolean is_active
timestamp created_at
timestamp updated_at
}
ATHLETES {
serial id PK
int user_id FK
varchar sport
varchar category
varchar position
varchar weight
varchar height
date birth_date
varchar city
varchar state
varchar country
varchar whatsapp
varchar instagram
varchar current_club
text bio
text description
text goals
boolean is_public
boolean is_verified
timestamp created_at
timestamp updated_at
}
VIDEOS {
serial id PK
int athlete_id FK
text video_url
text thumbnail
varchar title
varchar type
text description
int views
varchar status
text rejection_reason
timestamp created_at
timestamp updated_at
}
SUBSCRIPTIONS {
serial id PK
int user_id FK
varchar plan_name
varchar status
timestamp expires_at
varchar payment_id
timestamp created_at
timestamp updated_at
}
PAYMENTS {
serial id PK
int user_id FK
varchar type
varchar package_type
varchar plan_name
decimal amount
varchar currency
varchar status
varchar payment_method
varchar external_payment_id
timestamp created_at
timestamp updated_at
}
FAVORITES {
serial id PK
int user_id FK
int athlete_id FK
timestamp created_at
}
LIKES {
serial id PK
int user_id FK
int video_id FK
timestamp created_at
}
USERS ||--o{ ATHLETES : "has"
ATHLETES ||--o{ VIDEOS : "owns"
USERS ||--o{ SUBSCRIPTIONS : "has"
USERS ||--o{ PAYMENTS : "initiates"
USERS ||--o{ FAVORITES : "creates"
ATHLETES ||--o{ FAVORITES : "is favorited by"
USERS ||--o{ LIKES : "creates"
VIDEOS ||--o{ LIKES : "receives"
```

**Diagram sources**
- [schema.sql:14-184](file://database/schema.sql#L14-L184)

```mermaid
flowchart TD
Start(["Model Method Entry"]) --> BuildQuery["Build Parameterized Query"]
BuildQuery --> Exec["Execute via Pool.query()"]
Exec --> Rows{"Rows Returned?"}
Rows --> |Yes| Map["Map to JS Object(s)"]
Rows --> |No| Empty["Return Empty Set"]
Map --> Done(["Return Result"])
Empty --> Done
```

**Diagram sources**
- [video.model.js:7-16](file://backend/models/video.model.js#L7-L16)
- [subscription.model.js:7-16](file://backend/models/subscription.model.js#L7-L16)
- [database.js:4-10](file://backend/config/database.js#L4-L10)

**Section sources**
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [schema.sql:14-184](file://database/schema.sql#L14-L184)
- [video.model.js:1-78](file://backend/models/video.model.js#L1-L78)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [athlete.model.js:1-119](file://backend/models/athlete.model.js#L1-L119)
- [like.model.js:1-61](file://backend/models/like.model.js#L1-L61)

### Authentication and Authorization Middleware
Authentication middleware verifies JWT tokens, attaches user context to requests, and handles token expiration and invalid token errors. Authorization middleware restricts endpoints to allowed user types.

```mermaid
sequenceDiagram
participant Client as "Client"
participant Route as "Route Handler"
participant Auth as "Auth Middleware"
participant UserDB as "User Lookup"
participant Next as "Next Handler"
Client->>Route : Request with Authorization : Bearer <token>
Route->>Auth : authenticate()
Auth->>Auth : Verify JWT
Auth->>UserDB : Find user by ID
UserDB-->>Auth : User record
Auth->>Route : Attach req.userId and req.user
Route->>Next : next()
Next-->>Client : Proceed to controller
```

**Diagram sources**
- [auth.middleware.js:4-33](file://backend/middleware/auth.middleware.js#L4-L33)

**Section sources**
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)

### Webhook Handling and Asynchronous Processing
Current code does not implement webhook endpoints or dedicated asynchronous queues. To support production-grade integrations:
- Define webhook endpoints for external services (e.g., payment notifications)
- Implement idempotent handlers with stored event signatures
- Offload long-running tasks to background workers or queues
- Add retry logic with exponential backoff and dead-letter handling

### Service-to-Service Communication Protocols
Controllers currently orchestrate internal logic and mock external integrations. For inter-service communication:
- Use signed requests or shared secrets for trust boundaries
- Implement circuit breakers and bulkheads for resilience
- Apply request correlation IDs for observability
- Prefer eventual consistency patterns for cross-service updates

## Dependency Analysis
External dependencies relevant to integration patterns:
- Cloudinary: used for media uploads and transformations
- MercadoPago: used for payment preference creation and status checks
- pg: PostgreSQL driver providing connection pooling
- jsonwebtoken: token-based authentication
- dotenv: environment variable loading
- multer: file upload processing with memory storage
- stream: Node.js stream processing for Cloudinary uploads

```mermaid
graph LR
Server["server.js"] --> UploadRoutes["upload.routes.js"]
Server --> VideoRoutes["video.routes.js"]
UploadRoutes --> Multer["multer"]
UploadRoutes --> Cloudinary["cloudinary.js"]
UploadRoutes --> Controllers["payment.controller.js<br/>video.controller.js"]
VideoRoutes --> Controllers
Controllers --> Models["video.model.js<br/>subscription.model.js<br/>athlete.model.js<br/>like.model.js"]
Models --> Pool["database.js"]
Controllers -. "SDK usage" .-> Cloud["cloudinary:*"]
Controllers -. "SDK usage" .-> MP["mercadopago:*"]
Server --> MW["auth.middleware.js"]
Server --> SubMW["subscription.middleware.js"]
```

**Diagram sources**
- [server.js:1-66](file://backend/server.js#L1-L66)
- [upload.routes.js:1-131](file://backend/routes/upload.routes.js#L1-L131)
- [video.routes.js:1-23](file://backend/routes/video.routes.js#L1-L23)
- [upload.routes.js:25-39](file://backend/routes/upload.routes.js#L25-L39)
- [cloudinary.js:1-16](file://backend/config/cloudinary.js#L1-L16)
- [payment.controller.js:1-108](file://backend/controllers/payment.controller.js#L1-L108)
- [video.controller.js:1-168](file://backend/controllers/video.controller.js#L1-L168)
- [video.model.js:1-78](file://backend/models/video.model.js#L1-L78)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [athlete.model.js:1-119](file://backend/models/athlete.model.js#L1-L119)
- [like.model.js:1-61](file://backend/models/like.model.js#L1-L61)
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [subscription.middleware.js:1-50](file://backend/middleware/subscription.middleware.js#L1-L50)
- [package.json:10-20](file://backend/package.json#L10-L20)

**Section sources**
- [package.json:10-20](file://backend/package.json#L10-L20)

## Performance Considerations
- Connection pooling: The pool is configured with environment variables and reused across models to minimize overhead
- Cloudinary streaming: Memory-based buffering prevents disk I/O overhead for large file processing
- Indexes: Strategic indexes on foreign keys and frequently filtered columns improve query performance
- Triggers: Updated-at triggers reduce manual timestamp management and keep audit trails consistent
- Query patterns: Parameterized queries prevent injection and enable plan reuse
- File size limits: Implemented at both frontend and backend levels to prevent resource exhaustion
- Resource type detection: Automatic categorization reduces manual configuration overhead

**Section sources**
- [database.js:4-10](file://backend/config/database.js#L4-L10)
- [upload.routes.js:8-12](file://backend/routes/upload.routes.js#L8-L12)
- [UploadVideo.jsx:48-58](file://frontend/src/pages/UploadVideo.jsx#L48-L58)
- [schema.sql:140-179](file://database/schema.sql#L140-L179)

## Troubleshooting Guide
Common issues and resolutions:
- Authentication failures:
  - Missing or malformed Authorization header
  - Expired or invalid JWT token
  - User not found after token verification
- Cloudinary upload failures:
  - Invalid API credentials or URL configuration
  - Network timeouts during large file streaming
  - Buffer processing errors for oversized files
  - Resource type mismatch for uploaded content
- Payment flow issues:
  - Invalid package or plan selection
  - Missing payment confirmation payload
  - Subscription persistence errors
- Database connectivity:
  - Incorrect environment variables
  - Pool exhaustion under load
  - Slow queries due to missing indexes
- External service integration:
  - Missing SDK credentials
  - Network timeouts or rate limits
  - Idempotency gaps in webhook handling

Operational checks:
- Verify environment variables for database and JWT
- Confirm Cloudinary configuration (URL or individual credentials)
- Test file upload limits and format validations
- Review logs for middleware and controller error responses
- Monitor Cloudinary API response times and error rates
- Test webhook endpoints with signed events and deduplication

**Section sources**
- [auth.middleware.js:4-33](file://backend/middleware/auth.middleware.js#L4-L33)
- [cloudinary.js:3-13](file://backend/config/cloudinary.js#L3-L13)
- [upload.routes.js:86-98](file://backend/routes/upload.routes.js#L86-L98)
- [payment.controller.js:31-107](file://backend/controllers/payment.controller.js#L31-L107)
- [database.js:4-10](file://backend/config/database.js#L4-L10)
- [schema.sql:140-179](file://database/schema.sql#L140-L179)

## Conclusion
Craque-Vision's backend implements a clear adapter pattern for external services (Cloudinary and MercadoPago) and a robust PostgreSQL integration with connection pooling, indexes, and triggers. The new Cloudinary integration provides comprehensive video upload capabilities with buffer streaming, automatic resource type detection, and secure URL generation. Controllers orchestrate payment flows with mock endpoints, while middleware enforces authentication and authorization. For production readiness, integrate webhook endpoints, implement retry/backoff strategies, and adopt asynchronous processing for long-running tasks.

## Appendices
- Environment variables to configure:
  - Database: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - JWT: JWT_SECRET
  - Cloudinary: CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - External services: MercadoPago credentials (as needed)
- Recommended additions:
  - Webhook endpoints for payment providers
  - Background job queue for asynchronous tasks
  - Circuit breaker and retry policies for external calls
  - Health checks and metrics exposure
  - Cloudinary CDN configuration for optimized delivery
  - File format validation and sanitization
  - Rate limiting for upload endpoints