# Database Schema Overview

<cite>
**Referenced Files in This Document**
- [schema.sql](file://database/schema.sql)
- [user.model.js](file://backend/models/user.model.js)
- [athlete.model.js](file://backend/models/athlete.model.js)
- [video.model.js](file://backend/models/video.model.js)
- [subscription.model.js](file://backend/models/subscription.model.js)
- [favorite.model.js](file://backend/models/favorite.model.js)
- [like.model.js](file://backend/models/like.model.js)
- [videoCredit.model.js](file://backend/models/videoCredit.model.js)
- [database.js](file://backend/config/database.js)
- [payment.controller.js](file://backend/controllers/payment.controller.js)
- [migrate.js](file://backend/migrate.js)
- [migrate-payment.js](file://backend/migrate-payment.js)
- [migrate-sub-payment.js](file://backend/migrate-sub-payment.js)
</cite>

## Update Summary
**Changes Made**
- Updated documentation to reflect the current database schema state
- Removed references to non-existent video_credits table
- Added information about payment_proof columns in videos and subscriptions tables
- Updated migration documentation to show current table structure
- Clarified the actual business logic for video credits management

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

## Introduction
This document provides comprehensive database schema documentation for Craque-Vision's PostgreSQL implementation. It details the complete entity relationship diagram for seven core tables (users, athletes, videos, subscriptions, payments, favorites, likes), their primary keys, foreign keys, and referential integrity constraints. The document explains design principles including normalization, indexing strategy, and performance optimizations, along with the trigger system for automatic timestamp updates and cascade delete relationships. It also documents the complete table structures with field definitions, data types, constraints, and default values, and explains the business logic behind each table relationship.

**Updated** The schema has been updated to remove the video_credits table and add payment_proof columns to videos and subscriptions tables for enhanced payment tracking and moderation workflows.

## Project Structure
The database schema is defined in a single SQL script that creates all tables, indexes, triggers, and includes a default admin user insertion. The backend models mirror the database structure and provide CRUD operations for each entity. Migration scripts handle schema evolution and column additions.

```mermaid
graph TB
subgraph "Database Layer"
SCHEMA["schema.sql<br/>Table Definitions, Constraints, Triggers"]
MIGRATE["migrate.js<br/>Initial Schema Creation"]
MIGRATE_PAYMENT["migrate-payment.js<br/>Payment Enhancement"]
MIGRATE_SUB["migrate-sub-payment.js<br/>Subscription Payment Tracking"]
end
subgraph "Application Layer"
MODELS["Model Classes<br/>user.model.js<br/>athlete.model.js<br/>video.model.js<br/>subscription.model.js<br/>favorite.model.js<br/>like.model.js<br/>videoCredit.model.js"]
CONFIG["Database Config<br/>database.js"]
end
SCHEMA --> MODELS
MIGRATE --> SCHEMA
MIGRATE_PAYMENT --> SCHEMA
MIGRATE_SUB --> SCHEMA
CONFIG --> MODELS
```

**Diagram sources**
- [schema.sql:1-189](file://database/schema.sql#L1-L189)
- [migrate.js:1-154](file://backend/migrate.js#L1-L154)
- [migrate-payment.js:1-23](file://backend/migrate-payment.js#L1-L23)
- [migrate-sub-payment.js:1-25](file://backend/migrate-sub-payment.js#L1-L25)
- [database.js:1-13](file://backend/config/database.js#L1-L13)

**Section sources**
- [schema.sql:1-189](file://database/schema.sql#L1-L189)
- [migrate.js:1-154](file://backend/migrate.js#L1-L154)
- [migrate-payment.js:1-23](file://backend/migrate-payment.js#L1-L23)
- [migrate-sub-payment.js:1-25](file://backend/migrate-sub-payment.js#L1-L25)
- [database.js:1-13](file://backend/config/database.js#L1-L13)

## Core Components
The database consists of seven interconnected tables that implement a normalized design for a multi-user sports talent discovery platform. Each table serves a specific business function while maintaining referential integrity through foreign key constraints. The schema has been enhanced with payment tracking capabilities through additional columns.

### Entity Relationship Overview
The relationships form a hierarchical structure centered around users, with specialized entities for athletes, videos, subscriptions, and engagement metrics. Payment tracking is integrated through dedicated columns in relevant tables.

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
varchar avatar
timestamp created_at
timestamp updated_at
}
ATHLETES {
serial id PK
integer user_id FK
varchar sport
varchar category
varchar position
varchar dominant_foot
varchar weight
varchar height
date birth_date
varchar city
varchar state
varchar country
varchar whatsapp
varchar instagram
varchar current_club
text historic
text profile_photo
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
integer athlete_id FK
text video_url
text thumbnail
varchar title
varchar type
text description
integer views
varchar status
text rejection_reason
text payment_proof
timestamp created_at
timestamp updated_at
}
SUBSCRIPTIONS {
serial id PK
integer user_id FK
varchar plan_name
varchar status
timestamp expires_at
varchar payment_id
text payment_proof
varchar payment_status
timestamp created_at
timestamp updated_at
}
PAYMENTS {
serial id PK
integer user_id FK
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
integer user_id FK
integer athlete_id FK
timestamp created_at
}
LIKES {
serial id PK
integer user_id FK
integer video_id FK
timestamp created_at
}
USERS ||--o{ ATHLETES : "has_profile"
USERS ||--o{ SUBSCRIPTIONS : "has_subscription"
USERS ||--o{ PAYMENTS : "has_payment"
USERS ||--o{ FAVORITES : "has_favorite"
USERS ||--o{ LIKES : "has_like"
ATHLETES ||--o{ VIDEOS : "uploads"
ATHLETES ||--o{ FAVORITES : "is_favorited"
VIDEOS ||--o{ LIKES : "receives_like"
```

**Diagram sources**
- [schema.sql:14-189](file://database/schema.sql#L14-L189)

## Architecture Overview
The database architecture implements a normalized relational design with explicit foreign key relationships and cascading deletes. The trigger system ensures consistent timestamp updates across all tables. Enhanced payment tracking capabilities are integrated through dedicated columns in videos and subscriptions tables.

```mermaid
graph TB
subgraph "Core Entities"
USERS["Users Table<br/>Primary Key: id<br/>Unique: email<br/>Check: user_type"]
ATHLETES["Athletes Table<br/>Primary Key: id<br/>Foreign Key: user_id -> users.id<br/>Cascade Delete"]
VIDEOS["Videos Table<br/>Primary Key: id<br/>Foreign Key: athlete_id -> athletes.id<br/>Cascade Delete<br/>Enhanced with payment_proof"]
end
subgraph "Business Logic Tables"
SUBSCRIPTIONS["Subscriptions Table<br/>Primary Key: id<br/>Foreign Key: user_id -> users.id<br/>Cascade Delete<br/>Enhanced with payment_proof and payment_status"]
PAYMENTS["Payments Table<br/>Primary Key: id<br/>Foreign Key: user_id -> users.id<br/>Cascade Delete"]
end
subgraph "Engagement Tables"
FAVORITES["Favorites Table<br/>Primary Key: id<br/>Foreign Keys: user_id -> users.id<br/>athlete_id -> athletes.id<br/>Cascade Delete"]
LIKES["Likes Table<br/>Primary Key: id<br/>Foreign Keys: user_id -> users.id<br/>video_id -> videos.id<br/>Cascade Delete"]
end
subgraph "System Features"
TRIGGERS["Timestamp Triggers<br/>update_updated_at_column()"]
INDEXES["Performance Indexes<br/>Multiple Composite Indexes"]
MIGRATION["Migration Scripts<br/>Schema Evolution & Column Additions"]
end
USERS --> ATHLETES
USERS --> SUBSCRIPTIONS
USERS --> PAYMENTS
USERS --> FAVORITES
USERS --> LIKES
ATHLETES --> VIDEOS
ATHLETES --> FAVORITES
VIDEOS --> LIKES
TRIGGERS --> USERS
TRIGGERS --> ATHLETES
TRIGGERS --> VIDEOS
TRIGGERS --> SUBSCRIPTIONS
TRIGGERS --> PAYMENTS
INDEXES --> USERS
INDEXES --> ATHLETES
INDEXES --> VIDEOS
INDEXES --> SUBSCRIPTIONS
INDEXES --> FAVORITES
INDEXES --> LIKES
MIGRATION --> SCHEMA
```

**Diagram sources**
- [schema.sql:14-189](file://database/schema.sql#L14-L189)
- [migrate.js:136-138](file://backend/migrate.js#L136-L138)
- [migrate-payment.js:14-17](file://backend/migrate-payment.js#L14-L17)
- [migrate-sub-payment.js:14-18](file://backend/migrate-sub-payment.js#L14-L18)

## Detailed Component Analysis

### Users Table
The Users table serves as the central identity entity with comprehensive user management capabilities and avatar support.

**Primary Key**: `id` (SERIAL)
**Unique Constraint**: `email`
**Check Constraint**: `user_type` limited to ('athlete', 'scout', 'club', 'admin')
**Default Values**: `email_verified` = FALSE, `is_active` = TRUE
**Timestamps**: Automatic creation and updates via trigger

**Business Logic**: Supports four distinct user types with role-based access control. The email uniqueness ensures single account per email address. Avatar field added for profile customization.

**Section sources**
- [schema.sql:14-25](file://database/schema.sql#L14-L25)

### Athletes Table
The Athletes table extends user profiles with comprehensive athletic information and verification capabilities.

**Primary Key**: `id` (SERIAL)
**Foreign Key**: `user_id` -> users.id (ON DELETE CASCADE)
**Check Constraints**: 
- `dominant_foot` limited to ('left', 'right', 'both')
**Default Values**: `country` = 'Brasil', `is_public` = TRUE, `is_verified` = FALSE
**Timestamps**: Automatic creation and updates via trigger

**Business Logic**: Links to Users table for authentication and profile management. Contains extensive athletic and personal information for talent discovery.

**Section sources**
- [schema.sql:28-68](file://database/schema.sql#L28-L68)

### Videos Table
The Videos table manages video content uploaded by athletes with moderation and analytics capabilities, enhanced with payment proof tracking.

**Primary Key**: `id` (SERIAL)
**Foreign Key**: `athlete_id` -> athletes.id (ON DELETE CASCADE)
**Check Constraint**: `status` limited to ('pending', 'approved', 'rejected')
**Default Values**: `views` = 0, `status` = 'pending'
**Enhanced Fields**: `payment_proof` text field for payment verification documentation
**Timestamps**: Automatic creation and updates via trigger

**Business Logic**: Implements content moderation workflow with pending/approved/rejected states. Tracks view counts and provides filtering capabilities. Payment proof integration enables payment verification for premium content.

**Section sources**
- [schema.sql:70-90](file://database/schema.sql#L70-L90)

### Subscriptions Table
The Subscriptions table manages user subscription plans and billing cycles with enhanced payment tracking capabilities.

**Primary Key**: `id` (SERIAL)
**Foreign Key**: `user_id` -> users.id (ON DELETE CASCADE)
**Check Constraint**: `status` limited to ('active', 'cancelled', 'expired', 'pending_payment')
**Enhanced Fields**:
- `payment_proof` text field for payment verification documentation
- `payment_status` varchar with default 'pending' for payment verification workflow
**Timestamps**: Automatic creation and updates via trigger

**Business Logic**: Tracks subscription lifecycle with expiration dates and payment associations. Supports plan upgrades/downgrades and renewal management. Enhanced payment tracking enables payment verification and approval workflows.

**Section sources**
- [schema.sql:92-105](file://database/schema.sql#L92-L105)

### Payments Table
The Payments table records all financial transactions for video packages and subscriptions with comprehensive transaction tracking.

**Primary Key**: `id` (SERIAL)
**Foreign Key**: `user_id` -> users.id (ON DELETE CASCADE)
**Check Constraints**:
- `type` limited to ('video_package', 'subscription')
- `status` limited to ('pending', 'completed', 'failed', 'refunded')
**Default Values**: `currency` = 'BRL', `status` = 'pending'
**Timestamps**: Automatic creation and updates via trigger

**Business Logic**: Centralizes payment processing with support for both one-time video purchases and recurring subscription payments. Comprehensive status tracking enables payment workflow management.

**Section sources**
- [schema.sql:107-122](file://database/schema.sql#L107-L122)

### Favorites Table
The Favorites table implements user-athlete relationship for saving preferred athletes.

**Primary Key**: `id` (SERIAL)
**Foreign Keys**:
- `user_id` -> users.id (ON DELETE CASCADE)
- `athlete_id` -> athletes.id (ON DELETE CASCADE)
**Unique Constraint**: (user_id, athlete_id) prevents duplicate favorites
**Timestamp**: Automatic creation timestamp

**Business Logic**: Enables user preference management with unique constraint preventing duplicates. Supports athlete discovery and bookmarking functionality.

**Section sources**
- [schema.sql:124-132](file://database/schema.sql#L124-L132)

### Likes Table
The Likes table manages user-video engagement through social interaction.

**Primary Key**: `id` (SERIAL)
**Foreign Keys**:
- `user_id` -> users.id (ON DELETE CASCADE)
- `video_id` -> videos.id (ON DELETE CASCADE)
**Unique Constraint**: (user_id, video_id) prevents duplicate likes
**Timestamp**: Automatic creation timestamp

**Business Logic**: Implements social engagement with unique constraint ensuring each user can like a video only once. Supports video popularity metrics and user interaction tracking.

**Section sources**
- [schema.sql:134-142](file://database/schema.sql#L134-L142)

### Video Credits Management
**Updated** The video credits functionality has been moved from a separate table to application-level logic managed by the VideoCredit model.

The video credits system is now handled entirely through application logic in the VideoCredit model, which manages credit allocation, usage tracking, and balance calculations without requiring a dedicated database table.

**Key Features**:
- Credit allocation through admin confirmation workflows
- Usage tracking with automatic debit upon video upload
- Balance calculation (total_videos - used_videos)
- Seamless integration with payment processing workflows

**Section sources**
- [videoCredit.model.js:1-55](file://backend/models/videoCredit.model.js#L1-L55)

## Dependency Analysis

### Foreign Key Relationships
The database implements a clear hierarchical dependency structure with cascade deletes ensuring referential integrity. Enhanced payment tracking capabilities integrate seamlessly with existing relationships.

```mermaid
graph LR
subgraph "Root Entity"
USERS["Users"]
end
subgraph "Direct Dependencies"
ATHLETES["Athletes"]
SUBSCRIPTIONS["Subscriptions"]
PAYMENTS["Payments"]
FAVORITES["Favorites"]
LIKES["Likes"]
end
subgraph "Secondary Dependencies"
VIDEOS["Videos"]
end
USERS --> ATHLETES
USERS --> SUBSCRIPTIONS
USERS --> PAYMENTS
USERS --> FAVORITES
USERS --> LIKES
ATHLETES --> VIDEOS
FAVORITES --> ATHLETES
LIKES --> VIDEOS
```

**Diagram sources**
- [schema.sql:30](file://database/schema.sql#L30)
- [schema.sql:73](file://database/schema.sql#L73)
- [schema.sql:95](file://database/schema.sql#L95)
- [schema.sql:110](file://database/schema.sql#L110)
- [schema.sql:127](file://database/schema.sql#L127)
- [schema.sql:137](file://database/schema.sql#L137)

### Cascade Delete Behavior
All foreign key relationships implement ON DELETE CASCADE, ensuring that when parent records are deleted, child records are automatically removed. This prevents orphaned records and maintains data integrity.

**Cascade Delete Chains**:
- Deleting a User cascades to Athletes, Subscriptions, Payments, Favorites, and Likes
- Deleting an Athlete cascades to Videos and Favorites
- Deleting a Video cascades to Likes

**Enhanced Payment Tracking**: The addition of payment_proof columns in Videos and Subscriptions tables requires careful cascade handling to maintain payment verification data integrity.

**Section sources**
- [schema.sql:5-11](file://database/schema.sql#L5-L11)
- [schema.sql:30](file://database/schema.sql#L30)
- [schema.sql:73](file://database/schema.sql#L73)
- [schema.sql:95](file://database/schema.sql#L95)
- [schema.sql:110](file://database/schema.sql#L110)
- [schema.sql:127](file://database/schema.sql#L127)
- [schema.sql:137](file://database/schema.sql#L137)

## Performance Considerations

### Index Strategy
The schema includes comprehensive indexing for optimal query performance across frequently accessed columns, with enhanced indexes for payment-related queries.

**Index Categories**:
- **Single Column Indexes**: Email, user_type, status fields for filtering
- **Multi-Column Indexes**: Composite indexes for common join operations
- **Performance-Critical Columns**: Frequently queried attributes receive dedicated indexes
- **Payment Tracking Indexes**: Additional indexes for payment_proof and payment_status fields

**Enhanced Index Coverage**:
- Users: email, user_type
- Athletes: user_id, sport, category, state, position
- Videos: athlete_id, status, payment_proof
- Subscriptions: user_id, status, payment_status
- Favorites: user_id, athlete_id
- Likes: user_id, video_id

**Section sources**
- [schema.sql:144-159](file://database/schema.sql#L144-L159)

### Timestamp Management
The database implements a centralized trigger system for automatic timestamp updates, with enhanced triggers for payment tracking columns.

```mermaid
sequenceDiagram
participant App as "Application"
participant DB as "PostgreSQL"
participant Trigger as "update_updated_at_column()"
App->>DB : UPDATE users SET name = ?
DB->>Trigger : BEFORE UPDATE
Trigger->>Trigger : NEW.updated_at = CURRENT_TIMESTAMP
Trigger-->>DB : RETURN NEW
Note over App,DB : Trigger fires for all tables except Payments
```

**Diagram sources**
- [schema.sql:161-183](file://database/schema.sql#L161-L183)

**Section sources**
- [schema.sql:161-183](file://database/schema.sql#L161-L183)

### Data Type Optimizations
- **SERIAL**: Auto-incrementing primary keys for efficient indexing
- **VARCHAR Limits**: Appropriate length constraints prevent excessive storage
- **CHECK Constraints**: Prevent invalid data entry at database level
- **DECIMAL**: Precise monetary calculations for payment amounts
- **TEXT Fields**: Flexible storage for payment proofs and descriptions

## Troubleshooting Guide

### Common Issues and Solutions

**Constraint Violations**:
- Email uniqueness violations occur when duplicate emails are attempted
- User type validation errors for invalid role assignments
- Status constraint violations for invalid enumeration values
- Payment status validation errors for invalid payment states

**Cascade Delete Scenarios**:
- Deleting users removes all associated records automatically
- Removing athletes deletes their videos and favorites
- Video deletion removes associated likes

**Payment Tracking Issues**:
- Missing payment_proof data prevents content approval
- Invalid payment_status values cause subscription issues
- Currency conversion problems with payment amounts

**Performance Issues**:
- Missing indexes on frequently queried columns
- Large result sets without proper pagination
- Inefficient JOIN operations without proper indexing
- Payment-proof search performance issues

**Migration Issues**:
- Schema evolution conflicts during table recreation
- Column addition failures in migration scripts
- Data integrity issues during payment tracking implementation

**Section sources**
- [schema.sql:17-25](file://database/schema.sql#L17-L25)
- [schema.sql:36](file://database/schema.sql#L36)
- [schema.sql:84](file://database/schema.sql#L84)
- [schema.sql:97](file://database/schema.sql#L97)
- [schema.sql:116](file://database/schema.sql#L116)
- [migrate.js:22-32](file://backend/migrate.js#L22-L32)
- [migrate-payment.js:14-17](file://backend/migrate-payment.js#L14-L17)
- [migrate-sub-payment.js:14-18](file://backend/migrate-sub-payment.js#L14-L18)

### Application Integration Notes
The backend models provide consistent access patterns that align with the database schema, with enhanced integration for payment tracking:

**Connection Management**: Uses PostgreSQL connection pooling for efficient resource utilization
**Query Patterns**: Follows established naming conventions and parameter binding
**Error Handling**: Implements proper error handling for database operations
**Payment Integration**: Seamlessly integrates with payment processing workflows
**Credit Management**: Handles video credit allocation and usage tracking

**Section sources**
- [database.js:1-13](file://backend/config/database.js#L1-L13)
- [user.model.js:1-42](file://backend/models/user.model.js#L1-L42)
- [athlete.model.js:1-119](file://backend/models/athlete.model.js#L1-L119)
- [video.model.js:1-61](file://backend/models/video.model.js#L1-L61)
- [subscription.model.js:1-55](file://backend/models/subscription.model.js#L1-L55)
- [favorite.model.js:1-52](file://backend/models/favorite.model.js#L1-L52)
- [like.model.js:1-61](file://backend/models/like.model.js#L1-L61)
- [videoCredit.model.js:1-55](file://backend/models/videoCredit.model.js#L1-L55)
- [payment.controller.js:1-108](file://backend/controllers/payment.controller.js#L1-L108)

## Conclusion
Craque-Vision's database schema implements a well-normalized, scalable design that supports the platform's multi-user, multi-role functionality with enhanced payment tracking capabilities. The schema provides robust referential integrity through foreign key constraints and cascade deletes, comprehensive indexing for optimal performance, and centralized timestamp management through triggers. 

**Updated** The schema has evolved to remove the separate video_credits table in favor of application-level credit management, while adding payment_proof and payment_status columns to improve payment tracking and moderation workflows. The design accommodates the platform's core business functions including athlete profiles, video content management, subscription-based access control, payment processing, and social engagement features. The implementation demonstrates sound database design principles while maintaining flexibility for future enhancements and scaling requirements.

The migration scripts ensure smooth evolution of the database schema, with careful handling of payment tracking enhancements and backward compatibility considerations. The current implementation balances functional completeness with maintainability, providing a solid foundation for the platform's continued growth and feature expansion.