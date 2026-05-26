# Administrative Features

<cite>
**Referenced Files in This Document**
- [admin.controller.js](file://backend/controllers/admin.controller.js)
- [admin.routes.js](file://backend/routes/admin.routes.js)
- [auth.middleware.js](file://backend/middleware/auth.middleware.js)
- [auth.controller.js](file://backend/controllers/auth.controller.js)
- [user.model.js](file://backend/models/user.model.js)
- [video.model.js](file://backend/models/video.model.js)
- [athlete.model.js](file://backend/models/athlete.model.js)
- [subscription.model.js](file://backend/models/subscription.model.js)
- [carousel.model.js](file://backend/models/carousel.model.js)
- [carousel.routes.js](file://backend/routes/carousel.routes.js)
- [database.js](file://backend/config/database.js)
- [server.js](file://backend/server.js)
- [migrate.js](file://backend/migrate.js)
- [schema.sql](file://database/schema.sql)
- [AdminDashboard.jsx](file://frontend/src/pages/AdminDashboard.jsx)
- [api.js](file://frontend/src/services/api.js)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive carousel management system documentation
- Documented new carousel endpoints for image upload, management, and activation controls
- Updated administrative workflows to include carousel management operations
- Added carousel-specific API reference with complete endpoint specifications
- Enhanced frontend integration documentation for carousel management interface

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [API Reference](#api-reference)
7. [Security and Authorization](#security-and-authorization)
8. [Administrative Workflows](#administrative-workflows)
9. [System Monitoring](#system-monitoring)
10. [Content Moderation](#content-moderation)
11. [User Management](#user-management)
12. [Subscription Management](#subscription-management)
13. [Carousel Management System](#carousel-management-system)
14. [Audit Trails and Permissions](#audit-trails-and-permissions)
15. [Troubleshooting Guide](#troubleshooting-guide)
16. [Conclusion](#conclusion)

## Introduction

The Administrative Dashboard and System Management features provide comprehensive administrative capabilities for the Craque Vision platform. This system enables administrators to monitor platform health, manage user accounts, moderate content, track subscriptions, maintain overall system integrity, and manage promotional content through an integrated carousel system. The administrative interface combines robust backend APIs with a React-based frontend dashboard, providing real-time insights and operational controls.

The administrative system is built on a secure foundation with role-based access control, JWT authentication, and comprehensive data validation. It supports multiple user types (athlete, scout, club, admin) while maintaining strict separation of privileges through the admin role designation. The enhanced carousel management system allows administrators to upload promotional images, configure links, manage activation status, and control display order through an intuitive interface.

## Project Structure

The administrative system follows a modular architecture with clear separation of concerns, now including carousel management capabilities:

```mermaid
graph TB
subgraph "Backend Layer"
Server[Server.js]
Routes[Routes Layer]
Controllers[Controllers Layer]
Middleware[Middleware Layer]
Models[Models Layer]
Config[Config Layer]
Migration[Migrate.js]
end
subgraph "Frontend Layer"
AdminUI[AdminDashboard.jsx]
APIService[API Service]
AuthContext[Auth Context]
end
subgraph "Database Layer"
Schema[Schema.sql]
CarouselTable[Carousel Table]
Migration[Migration Scripts]
end
AdminUI --> APIService
APIService --> Server
Server --> Routes
Routes --> Controllers
Controllers --> Middleware
Controllers --> Models
Models --> Config
Config --> CarouselTable
Migration --> CarouselTable
CarouselTable --> Schema
```

**Diagram sources**
- [server.js:1-40](file://backend/server.js#L1-L40)
- [admin.routes.js:1-15](file://backend/routes/admin.routes.js#L1-L15)
- [admin.controller.js:1-121](file://backend/controllers/admin.controller.js#L1-L121)
- [carousel.routes.js:1-106](file://backend/routes/carousel.routes.js#L1-L106)
- [carousel.model.js:1-52](file://backend/models/carousel.model.js#L1-L52)
- [migrate.js:135-143](file://backend/migrate.js#L135-L143)

**Section sources**
- [server.js:1-40](file://backend/server.js#L1-L40)
- [admin.routes.js:1-15](file://backend/routes/admin.routes.js#L1-L15)
- [carousel.routes.js:1-106](file://backend/routes/carousel.routes.js#L1-L106)

## Core Components

The administrative system consists of several interconnected components that work together to provide comprehensive platform management capabilities, now enhanced with carousel management:

### Authentication and Authorization
The system implements a two-tier authentication system:
- **JWT Token Authentication**: Secure session management with 7-day expiration
- **Role-Based Access Control**: Strict admin-only endpoint protection
- **Optional Authentication**: Support for public endpoints requiring no authentication

### Data Management Layer
The system manages five primary data domains:
- **User Management**: Complete user lifecycle management
- **Content Moderation**: Video approval and rejection workflows
- **Analytics Dashboard**: Real-time platform statistics
- **Subscription Tracking**: Revenue and membership monitoring
- **Carousel Management**: Promotional image management and display control

### Frontend Interface
The React-based administrative dashboard provides:
- Real-time data visualization
- Interactive management controls
- Responsive design for various screen sizes
- Comprehensive filtering and sorting capabilities
- Integrated carousel management interface with upload forms and activation controls

**Section sources**
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [auth.controller.js:1-72](file://backend/controllers/auth.controller.js#L1-L72)
- [AdminDashboard.jsx:1-605](file://frontend/src/pages/AdminDashboard.jsx#L1-L605)

## Architecture Overview

The administrative architecture follows a layered pattern with clear separation between presentation, business logic, and data access layers, now including carousel management infrastructure:

```mermaid
sequenceDiagram
participant Admin as "Admin Dashboard"
participant API as "Carousel API"
participant Auth as "Auth Middleware"
participant Upload as "Multer Cloudinary"
participant Controller as "Carousel Controller"
participant Model as "Carousel Model"
participant DB as "PostgreSQL"
Admin->>API : POST /carousel (FormData)
API->>Auth : Verify JWT Token
Auth->>Model : Load User Data
Model->>DB : Query User Info
DB-->>Model : User Record
Model-->>Auth : User Object
Auth-->>API : Authorized Access
API->>Upload : Process Image Upload
Upload->>Upload : Validate File Type & Size
Upload->>Upload : Upload to Cloudinary
Upload-->>API : Return Secure URL
API->>Controller : createCarouselItem()
Controller->>Model : Execute INSERT Query
Model->>DB : Insert Carousel Item
DB-->>Model : New Item Record
Model-->>Controller : Created Item
Controller-->>API : JSON Response
API-->>Admin : Upload Confirmation
```

**Diagram sources**
- [carousel.routes.js:57-75](file://backend/routes/carousel.routes.js#L57-L75)
- [auth.middleware.js:4-33](file://backend/middleware/auth.middleware.js#L4-L33)
- [carousel.model.js:18-25](file://backend/models/carousel.model.js#L18-L25)

The architecture ensures that all administrative operations are:
- **Secure**: Through mandatory JWT authentication and role verification
- **Scalable**: With modular components and efficient database queries
- **Maintainable**: Following clean separation of concerns and consistent patterns
- **Cloud-Integrated**: With automated image processing and storage through Cloudinary

## Detailed Component Analysis

### Admin Controller Implementation

The Admin Controller serves as the central business logic layer for administrative operations:

```mermaid
classDiagram
class AdminController {
+getDashboardStats(req, res) Promise~void~
+getAllUsers(req, res) Promise~void~
+getAllVideos(req, res) Promise~void~
+getAllSubscriptions(req, res) Promise~void~
+approveVideo(req, res) Promise~void~
+rejectVideo(req, res) Promise~void~
+deleteUser(req, res) Promise~void~
}
class CarouselController {
+getAllCarouselItems(req, res) Promise~void~
+getAllCarouselItemsAdmin(req, res) Promise~void~
+createCarouselItem(req, res) Promise~void~
+updateCarouselItem(req, res) Promise~void~
+deleteCarouselItem(req, res) Promise~void~
}
class DatabasePool {
+query(sql, params) Promise~QueryResult~
}
class User {
+create(userData) Promise~User~
+findByEmail(email) Promise~User~
+findById(id) Promise~User~
+comparePassword(password, hash) Promise~boolean~
}
class Video {
+create(videoData) Promise~Video~
+findByAthleteId(id) Promise~Video[]~
+findById(id) Promise~Video~
+getFeatured(limit) Promise~Video[]~
+delete(id) Promise~Video~
}
class Subscription {
+create(subData) Promise~Subscription~
+findByUserId(id) Promise~Subscription~
+isActive(id) Promise~boolean~
+updateStatus(id, status) Promise~Subscription~
}
class Carousel {
+getAll() Promise~CarouselItem[]~
+getAllAdmin() Promise~CarouselItem[]~
+create(data) Promise~CarouselItem~
+update(id, fields) Promise~CarouselItem~
+delete(id) Promise~void~
}
AdminController --> DatabasePool : "uses"
AdminController --> User : "manages"
AdminController --> Video : "moderates"
AdminController --> Subscription : "monitors"
CarouselController --> DatabasePool : "uses"
CarouselController --> Carousel : "manages"
```

**Diagram sources**
- [admin.controller.js:1-121](file://backend/controllers/admin.controller.js#L1-L121)
- [carousel.model.js:3-49](file://backend/models/carousel.model.js#L3-L49)
- [user.model.js:4-42](file://backend/models/user.model.js#L4-L42)
- [video.model.js:3-61](file://backend/models/video.model.js#L3-L61)
- [subscription.model.js:3-55](file://backend/models/subscription.model.js#L3-L55)

### Authentication Middleware

The authentication system implements a sophisticated token-based security mechanism:

```mermaid
flowchart TD
Start([Request Received]) --> CheckAuthHeader["Check Authorization Header"]
CheckAuthHeader --> HasToken{"Has Bearer Token?"}
HasToken --> |No| Unauthorized["401 - Token Required"]
HasToken --> |Yes| ExtractToken["Extract JWT Token"]
ExtractToken --> VerifyToken["Verify JWT Signature"]
VerifyToken --> TokenValid{"Token Valid?"}
TokenValid --> |No| InvalidToken["401 - Invalid Token"]
TokenValid --> |Yes| LoadUser["Load User from Database"]
LoadUser --> UserExists{"User Exists?"}
UserExists --> |No| UserNotFound["401 - User Not Found"]
UserExists --> |Yes| CheckRole["Check Admin Role"]
CheckRole --> IsAdmin{"Is Admin?"}
IsAdmin --> |No| AccessDenied["403 - Access Denied"]
IsAdmin --> |Yes| Next["Proceed to Controller"]
Unauthorized --> End([Response])
InvalidToken --> End
UserNotFound --> End
AccessDenied --> End
Next --> End
```

**Diagram sources**
- [auth.middleware.js:4-42](file://backend/middleware/auth.middleware.js#L4-L42)

**Section sources**
- [admin.controller.js:1-121](file://backend/controllers/admin.controller.js#L1-L121)
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)

## API Reference

### Base URL and Authentication

**Base URL**: `/api/admin`

All administrative endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Admin Role**: Must have `user_type = 'admin'`
- **Token Expiration**: 7-day validity period

### Base URL and Authentication

**Base URL**: `/api/carousel`

All carousel management endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Admin Role**: Must have `user_type = 'admin'`
- **Token Expiration**: 7-day validity period

### Dashboard Analytics Endpoints

#### GET /stats
Retrieves comprehensive platform statistics for the administrative dashboard.

**Request**:
```
GET /api/admin/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "total_users": 150,
  "total_athletes": 120,
  "total_videos": 850,
  "active_subscriptions": 45,
  "athletes_count": 120,
  "scouts_count": 15,
  "clubs_count": 15
}
```

**Section sources**
- [admin.routes.js:6](file://backend/routes/admin.routes.js#L6)
- [admin.controller.js:7-31](file://backend/controllers/admin.controller.js#L7-L31)

### User Management Endpoints

#### GET /users
Retrieves all registered users with pagination and sorting capabilities.

**Request**:
```
GET /api/admin/users
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "athlete",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "user_type": "club",
    "created_at": "2024-01-14T14:22:00Z"
  }
]
```

**Section sources**
- [admin.routes.js:7](file://backend/routes/admin.routes.js#L7)
- [admin.controller.js:33-45](file://backend/controllers/admin.controller.js#L33-L45)

#### DELETE /users/:id
Deletes a user account and associated data.

**Request**:
```
DELETE /api/admin/users/123
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Usuário excluído"
}
```

**Section sources**
- [admin.routes.js:12](file://backend/routes/admin.routes.js#L12)
- [admin.controller.js:112-121](file://backend/controllers/admin.controller.js#L112-L121)

### Content Management Endpoints

#### GET /videos
Retrieves all uploaded videos with athlete and sport information.

**Request**:
```
GET /api/admin/videos
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": 1,
    "athlete_id": 5,
    "video_url": "https://example.com/video.mp4",
    "thumbnail": "https://example.com/thumb.jpg",
    "title": "Training Session",
    "type": "training",
    "description": "Morning training session",
    "views": 120,
    "status": "pending",
    "rejection_reason": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "athlete_name": "John Doe",
    "sport": "Football"
  }
]
```

**Section sources**
- [admin.routes.js:8](file://backend/routes/admin.routes.js#L8)
- [admin.controller.js:47-61](file://backend/controllers/admin.controller.js#L47-L61)

#### PUT /videos/:id/approve
Approves a pending video for public visibility.

**Request**:
```
PUT /api/admin/videos/456/approve
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Vídeo aprovado",
  "video": {
    "id": 456,
    "status": "approved",
    "title": "Training Session",
    "athlete_id": 5,
    "video_url": "https://example.com/video.mp4"
  }
}
```

**Section sources**
- [admin.routes.js:10](file://backend/routes/admin.routes.js#L10)
- [admin.controller.js:78-92](file://backend/controllers/admin.controller.js#L78-L92)

#### PUT /videos/:id/reject
Rejects a video with specified reason.

**Request**:
```
PUT /api/admin/videos/456/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violent content detected"
}
```

**Response**:
```json
{
  "message": "Vídeo rejeitado",
  "video": {
    "id": 456,
    "status": "rejected",
    "rejection_reason": "Violent content detected"
  }
}
```

**Section sources**
- [admin.routes.js:11](file://backend/routes/admin.routes.js#L11)
- [admin.controller.js:94-110](file://backend/controllers/admin.controller.js#L94-L110)

### Subscription Management Endpoints

#### GET /subscriptions
Retrieves all subscription records with user information.

**Request**:
```
GET /api/admin/subscriptions
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 10,
    "plan_name": "Premium Monthly",
    "status": "active",
    "expires_at": "2024-02-15T10:30:00Z",
    "payment_id": "pay_abc123",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "user_name": "John Doe",
    "email": "john@example.com"
  }
]
```

**Section sources**
- [admin.routes.js:9](file://backend/routes/admin.routes.js#L9)
- [admin.controller.js:63-76](file://backend/controllers/admin.controller.js#L63-L76)

### Carousel Management Endpoints

#### GET /
Retrieves all active carousel items for public display.

**Request**:
```
GET /api/carousel/
```

**Response**:
```json
[
  {
    "id": 1,
    "image_url": "https://res.cloudinary.com/demo/image/upload/v123/craque-vision/carousel/promo1.jpg",
    "title": "Summer Sale",
    "link": "https://example.com/summer-sale",
    "is_active": true,
    "sort_order": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /admin
Retrieves all carousel items including inactive ones for administrative management.

**Request**:
```
GET /api/carousel/admin
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": 1,
    "image_url": "https://res.cloudinary.com/demo/image/upload/v123/craque-vision/carousel/promo1.jpg",
    "title": "Summer Sale",
    "link": "https://example.com/summer-sale",
    "is_active": true,
    "sort_order": 0,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "image_url": "https://res.cloudinary.com/demo/image/upload/v123/craque-vision/carousel/promo2.jpg",
    "title": "New Feature",
    "link": null,
    "is_active": false,
    "sort_order": 1,
    "created_at": "2024-01-14T14:22:00Z"
  }
]
```

#### POST /
Creates a new carousel item with image upload and optional metadata.

**Request**:
```
POST /api/carousel/
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- image: [required] Image file (JPG, PNG, GIF, WebP, max 5MB)
- title: [optional] Carousel item title
- link: [optional] Destination URL
- sort_order: [optional] Display order (integer)
```

**Response**:
```json
{
  "message": "Imagem adicionada ao carrossel!",
  "item": {
    "id": 3,
    "image_url": "https://res.cloudinary.com/demo/image/upload/v123/craque-vision/carousel/newpromo.jpg",
    "title": "New Promotion",
    "link": "https://example.com/new-promotion",
    "is_active": true,
    "sort_order": 0,
    "created_at": "2024-01-16T09:15:00Z"
  }
}
```

#### PUT /:id
Updates carousel item properties including activation status and display order.

**Request**:
```
PUT /api/carousel/3
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Promotion",
  "link": "https://example.com/updated-promotion",
  "is_active": true,
  "sort_order": 5
}
```

**Response**:
```json
{
  "message": "Item atualizado!",
  "item": {
    "id": 3,
    "image_url": "https://res.cloudinary.com/demo/image/upload/v123/craque-vision/carousel/newpromo.jpg",
    "title": "Updated Promotion",
    "link": "https://example.com/updated-promotion",
    "is_active": true,
    "sort_order": 5,
    "created_at": "2024-01-16T09:15:00Z"
  }
}
```

#### DELETE /:id
Deletes a carousel item from the database.

**Request**:
```
DELETE /api/carousel/3
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Imagem removida do carrossel."
}
```

**Section sources**
- [carousel.routes.js:36-103](file://backend/routes/carousel.routes.js#L36-L103)
- [carousel.model.js:3-49](file://backend/models/carousel.model.js#L3-L49)

## Security and Authorization

### Role-Based Access Control

The administrative system implements strict role-based access control through the authorization middleware:

```mermaid
flowchart LR
subgraph "User Types"
A[athlete] --> D[Basic User]
B[scout] --> D
C[club] --> D
E[admin] --> F[Administrator]
end
subgraph "Access Levels"
D --> G[Standard Endpoints]
F --> H[Admin Endpoints]
F --> I[All Endpoints]
end
H --> J[/api/admin/*]
I --> K[/api/*]
```

**Diagram sources**
- [auth.middleware.js:35-42](file://backend/middleware/auth.middleware.js#L35-L42)
- [schema.sql:19](file://database/schema.sql#L19)

### JWT Token Security

The authentication system employs industry-standard security practices:

- **Token Generation**: HS256 algorithm with configurable expiration
- **Token Validation**: Signature verification and expiration checking
- **Error Handling**: Specific error responses for different failure scenarios
- **Token Storage**: Client-side storage with automatic cleanup on logout

### Database Security

The database layer implements multiple security measures:

- **SQL Injection Prevention**: Parameterized queries throughout
- **Data Validation**: Type checking and constraint enforcement
- **Index Protection**: Optimized indexing for security and performance
- **Connection Pooling**: Efficient resource management

### Carousel Upload Security

The carousel upload system implements comprehensive security measures:

- **File Type Validation**: Only allows JPG, PNG, GIF, WebP formats
- **Size Limiting**: Maximum 5MB file size restriction
- **Cloud Storage**: Secure Cloudinary integration with HTTPS delivery
- **Input Sanitization**: Proper parameter binding for database operations

**Section sources**
- [auth.middleware.js:1-59](file://backend/middleware/auth.middleware.js#L1-L59)
- [auth.controller.js:4-6](file://backend/controllers/auth.controller.js#L4-L6)
- [schema.sql:181-185](file://database/schema.sql#L181-L185)
- [carousel.routes.js:10-19](file://backend/routes/carousel.routes.js#L10-L19)

## Administrative Workflows

### User Account Management Workflow

```mermaid
sequenceDiagram
participant Admin as "Admin User"
participant API as "Admin API"
participant DB as "Database"
Admin->>API : GET /admin/users
API->>DB : Query users table
DB-->>API : User list
API-->>Admin : User data
Admin->>API : DELETE /admin/users/ : id
API->>DB : Delete user record
DB-->>API : Deletion confirmation
API-->>Admin : Success message
Note over Admin,DB : User deletion cascades to related records
```

**Diagram sources**
- [admin.routes.js:7](file://backend/routes/admin.routes.js#L7)
- [admin.controller.js:112-121](file://backend/controllers/admin.controller.js#L112-L121)

### Content Moderation Workflow

```mermaid
sequenceDiagram
participant Admin as "Admin Moderator"
participant API as "Admin API"
participant Video as "Video Model"
participant DB as "Database"
Admin->>API : GET /admin/videos
API->>DB : Query pending videos
DB-->>API : Pending video list
API-->>Admin : Video data
Admin->>API : PUT /admin/videos/ : id/approve
API->>Video : approveVideo()
Video->>DB : Update video status
DB-->>Video : Updated record
Video-->>API : Approved video
API-->>Admin : Approval confirmation
Admin->>API : PUT /admin/videos/ : id/reject
API->>Video : rejectVideo()
Video->>DB : Update status + rejection reason
DB-->>Video : Updated record
Video-->>API : Rejected video
API-->>Admin : Rejection confirmation
```

**Diagram sources**
- [admin.routes.js:10-11](file://backend/routes/admin.routes.js#L10-L11)
- [admin.controller.js:78-110](file://backend/controllers/admin.controller.js#L78-L110)

### Carousel Management Workflow

```mermaid
sequenceDiagram
participant Admin as "Admin Manager"
participant API as "Carousel API"
participant Upload as "Cloudinary"
participant Model as "Carousel Model"
participant DB as "Database"
Admin->>API : POST /carousel (FormData)
API->>Upload : Validate & Upload Image
Upload-->>API : Secure URL Generated
API->>Model : createCarouselItem()
Model->>DB : INSERT carousel item
DB-->>Model : New record
Model-->>API : Created item
API-->>Admin : Upload confirmation
Admin->>API : PUT /carousel/ : id (Update)
API->>Model : updateCarouselItem()
Model->>DB : UPDATE item properties
DB-->>Model : Updated record
Model-->>API : Updated item
API-->>Admin : Update confirmation
Admin->>API : DELETE /carousel/ : id
API->>Model : deleteCarouselItem()
Model->>DB : DELETE item
DB-->>Model : Deletion confirmed
Model-->>API : Success
API-->>Admin : Deletion confirmation
```

**Diagram sources**
- [carousel.routes.js:57-103](file://backend/routes/carousel.routes.js#L57-L103)
- [carousel.model.js:18-48](file://backend/models/carousel.model.js#L18-L48)

### System Monitoring Workflow

```mermaid
sequenceDiagram
participant Admin as "Admin Dashboard"
participant API as "Admin API"
participant Analytics as "Analytics Queries"
participant DB as "Database"
Admin->>API : GET /admin/stats
API->>Analytics : Execute dashboard queries
Analytics->>DB : COUNT users
DB-->>Analytics : User count
Analytics->>DB : COUNT athletes
DB-->>Analytics : Athlete count
Analytics->>DB : COUNT videos
DB-->>Analytics : Video count
Analytics->>DB : COUNT active subscriptions
DB-->>Analytics : Subscription count
Analytics->>DB : COUNT user_type
DB-->>Analytics : User type counts
Analytics-->>API : Aggregated statistics
API-->>Admin : Dashboard metrics
```

**Diagram sources**
- [admin.controller.js:7-31](file://backend/controllers/admin.controller.js#L7-L31)

**Section sources**
- [AdminDashboard.jsx:21-39](file://frontend/src/pages/AdminDashboard.jsx#L21-L39)

## System Monitoring

### Dashboard Analytics

The administrative dashboard provides comprehensive system monitoring through aggregated statistics:

#### Key Metrics
- **Total Users**: Platform-wide user registration count
- **Active Subscriptions**: Currently paid subscription holders
- **Content Volume**: Total video uploads and pending approvals
- **User Distribution**: Breakdown by user type (athlete, scout, club)

#### Real-Time Updates
The dashboard automatically refreshes data through concurrent API requests, providing up-to-date insights into platform health and growth metrics.

**Section sources**
- [admin.controller.js:7-31](file://backend/controllers/admin.controller.js#L7-L31)
- [AdminDashboard.jsx:21-39](file://frontend/src/pages/AdminDashboard.jsx#L21-L39)

## Content Moderation

### Video Approval Workflow

The content moderation system implements a comprehensive approval process:

#### Pending Content Review
- **Automatic Detection**: Videos marked as `pending` awaiting review
- **Moderator Interface**: Clear presentation of video details and metadata
- **Approval Process**: Single-click approval with immediate publication
- **Rejection Process**: Structured rejection with customizable reasons

#### Quality Standards
Content moderation follows established guidelines for:
- **Inappropriate Content**: Violence, explicit material, or policy violations
- **Technical Quality**: Poor upload quality or missing metadata
- **Platform Compliance**: Terms of service adherence

**Section sources**
- [admin.controller.js:78-110](file://backend/controllers/admin.controller.js#L78-L110)
- [AdminDashboard.jsx:41-57](file://frontend/src/pages/AdminDashboard.jsx#L41-L57)

## User Management

### User Lifecycle Management

The administrative user management system supports complete user lifecycle operations:

#### User Discovery
- **Search and Filter**: By email, user type, registration date
- **Activity Monitoring**: Last login and engagement metrics
- **Status Management**: Account activation/deactivation controls

#### Account Administration
- **Deletion Operations**: Complete user account removal
- **Role Changes**: User type modifications (with caution)
- **Verification Status**: Email verification and profile completion tracking

**Section sources**
- [admin.controller.js:33-45](file://backend/controllers/admin.controller.js#L33-L45)
- [admin.controller.js:112-121](file://backend/controllers/admin.controller.js#L112-L121)
- [AdminDashboard.jsx:198-224](file://frontend/src/pages/AdminDashboard.jsx#L198-L224)

## Subscription Management

### Revenue and Membership Monitoring

The subscription management system provides comprehensive oversight of platform monetization:

#### Subscription Analytics
- **Revenue Tracking**: Active subscription revenue streams
- **Churn Analysis**: Subscription cancellation and renewal patterns
- **Plan Performance**: Individual plan popularity and effectiveness
- **Expiration Monitoring**: Upcoming subscription expirations

#### Administrative Controls
- **Manual Status Updates**: Subscription status modification
- **Payment Verification**: Payment processing validation
- **Refund Processing**: Automated refund workflows

**Section sources**
- [admin.controller.js:63-76](file://backend/controllers/admin.controller.js#L63-L76)
- [AdminDashboard.jsx:288-304](file://frontend/src/pages/AdminDashboard.jsx#L288-L304)

## Carousel Management System

### Carousel Architecture

The carousel management system provides comprehensive promotional content management with the following architecture:

```mermaid
flowchart TD
subgraph "Carousel Data Flow"
A[Admin Upload Form] --> B[File Validation]
B --> C[Cloudinary Upload]
C --> D[Database Storage]
D --> E[Active Display]
end
subgraph "Admin Interface"
F[Carousel Tab] --> G[Upload Form]
F --> H[Management Table]
G --> I[Image Preview]
H --> J[Activation Toggle]
H --> K[Sort Order Control]
H --> L[Delete Action]
end
subgraph "Public Display"
M[Home Page] --> N[Carousel Component]
N --> O[Active Items Only]
O --> P[Auto Rotation]
end
```

**Diagram sources**
- [AdminDashboard.jsx:486-596](file://frontend/src/pages/AdminDashboard.jsx#L486-L596)
- [carousel.routes.js:57-75](file://backend/routes/carousel.routes.js#L57-L75)
- [carousel.model.js:4-16](file://backend/models/carousel.model.js#L4-L16)

### Carousel Data Model

The carousel system uses a structured data model optimized for promotional content management:

#### Database Schema
- **Primary Key**: Auto-incrementing ID for unique identification
- **Image URL**: Cloudinary secure URL for CDN-delivered images
- **Title**: Optional promotional headline (up to 255 characters)
- **Link**: Optional destination URL for click-through functionality
- **Activation Status**: Boolean flag controlling public visibility
- **Sort Order**: Integer for display priority and ordering
- **Timestamps**: Creation and update tracking

#### File Upload Specifications
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Maximum Size**: 5MB per image file
- **Cloud Storage**: Automatic upload to Cloudinary with HTTPS delivery
- **Optimization**: Automatic image optimization and responsive sizing

### Administrative Interface

The carousel management interface provides comprehensive administrative controls:

#### Upload Interface
- **Image Selection**: Drag-and-drop or file browser selection
- **Metadata Entry**: Title and link input fields (optional)
- **Preview Functionality**: Real-time image preview before upload
- **Validation Feedback**: Immediate feedback on file type and size constraints

#### Management Interface
- **Image Gallery**: Thumbnail preview of all carousel items
- **Activation Controls**: One-click enable/disable functionality
- **Sort Order Management**: Numeric input for display priority
- **Bulk Operations**: Confirmation dialogs for destructive actions

#### Public Display Logic
- **Active Filtering**: Automatic exclusion of inactive items
- **Order Priority**: Sort by `sort_order` ascending, then creation date
- **Responsive Design**: Adaptive sizing for different screen dimensions
- **Performance Optimization**: Lazy loading and CDN delivery

**Section sources**
- [AdminDashboard.jsx:105-142](file://frontend/src/pages/AdminDashboard.jsx#L105-L142)
- [carousel.routes.js:36-103](file://backend/routes/carousel.routes.js#L36-L103)
- [carousel.model.js:3-49](file://backend/models/carousel.model.js#L3-L49)
- [migrate.js:135-143](file://backend/migrate.js#L135-L143)

## Audit Trails and Permissions

### Administrative Permissions Matrix

| Endpoint | Method | Required Role | Purpose |
|----------|--------|---------------|---------|
| `/admin/stats` | GET | admin | Dashboard analytics |
| `/admin/users` | GET | admin | User listing |
| `/admin/users/:id` | DELETE | admin | User deletion |
| `/admin/videos` | GET | admin | Video listing |
| `/admin/videos/:id/approve` | PUT | admin | Video approval |
| `/admin/videos/:id/reject` | PUT | admin | Video rejection |
| `/admin/subscriptions` | GET | admin | Subscription listing |
| `/carousel/` | GET | public | Active carousel items |
| `/carousel/admin` | GET | admin | All carousel items |
| `/carousel/` | POST | admin | Add carousel item |
| `/carousel/:id` | PUT | admin | Update carousel item |
| `/carousel/:id` | DELETE | admin | Delete carousel item |

### Security Controls

The administrative system implements multiple layers of security:

#### Authentication Controls
- **Token-Based Authentication**: JWT for secure session management
- **Automatic Token Refresh**: 7-day expiration with renewal capability
- **Session Timeout**: Graceful handling of expired sessions

#### Authorization Controls
- **Role Verification**: Dynamic role checking for each request
- **Endpoint Protection**: Middleware protection for all admin routes
- **Permission Auditing**: Comprehensive logging of administrative actions

#### Data Protection
- **SQL Injection Prevention**: Parameterized queries throughout
- **Data Validation**: Input sanitization and validation
- **Privacy Compliance**: User data protection and GDPR considerations

#### Carousel Security
- **File Validation**: Strict MIME type and size restrictions
- **Cloud Security**: Secure Cloudinary integration with signed URLs
- **Access Control**: Admin-only management interfaces
- **Content Filtering**: Automatic sanitization of metadata fields

**Section sources**
- [admin.routes.js:6-12](file://backend/routes/admin.routes.js#L6-L12)
- [carousel.routes.js:36-103](file://backend/routes/carousel.routes.js#L36-L103)
- [auth.middleware.js:35-42](file://backend/middleware/auth.middleware.js#L35-L42)
- [schema.sql:19](file://database/schema.sql#L19)

## Troubleshooting Guide

### Common Authentication Issues

#### Token Not Provided
**Symptoms**: 401 Unauthorized responses
**Solution**: Ensure Authorization header includes valid Bearer token
**Prevention**: Implement proper token storage and automatic header injection

#### Token Expired
**Symptoms**: 401 Token expired error
**Solution**: Generate new token using refresh mechanism
**Prevention**: Implement automatic token renewal in client application

#### Invalid Token
**Symptoms**: 401 Invalid token error
**Solution**: Verify JWT_SECRET environment variable and token integrity
**Prevention**: Use consistent secret management across deployment environments

### Database Connection Issues

#### Connection Pool Exhaustion
**Symptoms**: Database timeout errors and slow response times
**Solution**: Monitor connection pool usage and adjust pool size
**Prevention**: Implement proper connection lifecycle management

#### Query Performance Issues
**Symptoms**: Slow administrative operations and dashboard loading
**Solution**: Review query execution plans and add appropriate indexes
**Prevention**: Regular database maintenance and query optimization

### Frontend Integration Issues

#### API Communication Failures
**Symptoms**: Network errors and failed administrative operations
**Solution**: Verify API base URL configuration and CORS settings
**Prevention**: Implement robust error handling and retry mechanisms

#### Authentication State Synchronization
**Symptoms**: Mixed authentication states and inconsistent UI behavior
**Solution**: Ensure proper token synchronization and state management
**Prevention**: Implement centralized authentication state management

### Carousel Management Issues

#### Image Upload Failures
**Symptoms**: 400 Bad Request errors during carousel uploads
**Common Causes**:
- Invalid file format (must be JPG, PNG, GIF, WebP)
- File too large (exceeds 5MB limit)
- Missing required image field
- Cloudinary upload failures

**Solutions**:
- Verify file format compatibility
- Check file size limitations
- Ensure FormData structure is correct
- Monitor Cloudinary service status

#### Activation Control Issues
**Symptoms**: Activation toggle not working or reverting state
**Solutions**:
- Verify admin authentication
- Check network connectivity for API calls
- Ensure proper boolean value handling
- Validate database connection

#### Display Problems
**Symptoms**: Carousel items not appearing or displaying incorrectly
**Solutions**:
- Verify `is_active` status is true
- Check `sort_order` values for proper ordering
- Validate Cloudinary image URLs
- Test responsive design across devices

**Section sources**
- [auth.middleware.js:24-32](file://backend/middleware/auth.middleware.js#L24-L32)
- [api.js:23-33](file://frontend/src/services/api.js#L23-L33)
- [carousel.routes.js:10-19](file://backend/routes/carousel.routes.js#L10-L19)

## Conclusion

The Administrative Dashboard and System Management features provide a comprehensive solution for platform administration and monitoring, now enhanced with robust carousel management capabilities. The system successfully balances security, usability, and functionality through its layered architecture and robust security controls.

Key strengths of the administrative system include:

- **Comprehensive Coverage**: Full suite of administrative capabilities from user management to content moderation and promotional content management
- **Security First Design**: Multi-layered authentication and authorization system with specialized carousel security measures
- **Real-Time Monitoring**: Live dashboard with instant analytics and reporting
- **Scalable Architecture**: Modular design supporting future expansion including carousel management
- **Developer-Friendly**: Clean API design with comprehensive documentation
- **Cloud Integration**: Professional image hosting and CDN delivery through Cloudinary
- **Responsive Design**: Mobile-friendly carousel interface with adaptive layouts

The system provides administrators with the tools necessary to maintain platform quality, monitor user engagement, manage promotional content effectively, and ensure compliance with platform policies. The combination of automated analytics, manual intervention capabilities, and professional carousel management creates an effective governance framework for the Craque Vision platform.

The enhanced carousel management system specifically addresses promotional content needs with:
- **Professional Image Handling**: Cloud-based storage with automatic optimization
- **Flexible Metadata Management**: Title and link support for contextual promotions
- **Intuitive Administration**: Simple drag-and-drop upload interface
- **Performance Optimization**: CDN delivery and lazy loading for fast page loads
- **Activation Controls**: Granular control over promotional content visibility

Future enhancements could include expanded carousel analytics, A/B testing capabilities for promotional content, advanced targeting options, and integration with external marketing platforms. The current architecture provides a solid foundation for these potential improvements while maintaining the security and reliability standards essential for administrative operations.