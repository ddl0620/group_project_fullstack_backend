# Eventify - Event Management Backend

Eventify Backend is a robust and scalable server-side application that powers the Eventify event management platform. Built with TypeScript and Express.js, it provides a comprehensive API for managing events, users, invitations, discussions, and notifications.

## About This Project

This project is a university group assignment for the Fullstack Development course at RMIT University. It was developed by Group 5 as part of their coursework requirements. The backend application provides the API and business logic for the Eventify event management platform.

## Live Demo

- **API URL**: [https://api.solve.vn/](https://api.solve.vn/)
- **Frontend Application**: [https://eventify.solve.vn/](https://eventify.solve.vn/)

## Technology Stack

The Eventify backend is built using the following technologies:

- **TypeScript**: Strongly-typed programming language that builds on JavaScript
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: MongoDB object modeling for Node.js
- **Joi**: Schema validation library
- **JWT**: JSON Web Tokens for authentication
- **OTP**: One-time password system for verification
- **Cron Jobs**: Scheduled tasks for automated operations
- **Cloudinary**: Cloud-based image and media management service

## Features

Eventify backend provides a comprehensive set of features to support the event management platform:

## Contributors

| Name             | Student ID | Role        | Email                 |
|------------------|------------|-------------|-----------------------|
| Khong Quoc Khanh | 4021494    | Team Lead   | s4021494@rmit.edu.vn  |
| Dao Duc Lam      | 4019052    | Team Member | s4019052@rmit.edu.vn  |
| [Tran Dinh Hai   | 4041605    | Team Member | s4041605@rmit.edu.vn  |
| Luong Chi Bach   | 4029308    | Team Member | s4029308@rmit.edu.vn  |
| Duong Bao Ngoc   | s3425449   | Team Member | ss3425449@rmit.edu.vn |


### User Management

- User registration with email verification
- Authentication using JWT tokens
- User profile management
- Role-based access control (admin, organizer, attendee)

### Event Management

- Create public or private events
- Update event details
- Delete events
- Retrieve events with filtering and pagination
- Track event engagement metrics

### Invitation System

- Send invitations to users for private events
- Track RSVP responses (accept/decline)
- Manage invitation status
- Set maximum invitation limits

### Discussion Board

- Create discussion posts for events
- Reply to discussion posts
- Support for hierarchical replies (nested comments)
- Soft deletion for maintaining data integrity

### Notification System

- Event reminders for upcoming events
- RSVP confirmation requests
- Event update notifications
- Discussion activity notifications
- Customizable notification settings

### Admin Dashboard

- System-wide statistics and metrics
- User management capabilities
- Configuration of system settings (max events, max invitations)
- Monitoring of platform activity

### Automated Tasks

- Scheduled reminders for upcoming events
- Cleanup of expired data
- Regular statistics calculation
- Email notifications for various events

## Project Structure

The backend follows a modular architecture with clear separation of concerns:

```
src/
├── config/                  # Configuration files
│   └── env.ts               # Environment variable configuration
│
├── controllers/             # Request handlers
│   ├── admin/               # Admin-specific controllers
│   │   ├── eventManagement.controller.ts  # Admin event management operations
│   │   └── userManagement.controller.ts   # Admin user management operations
│   ├── adminStatistics.controller.ts      # Admin dashboard statistics
│   ├── auth.controllers.ts                # Authentication controllers
│   ├── discussionPost.controllers.ts      # Discussion post controllers
│   ├── discussionReply.controllers.ts     # Discussion reply controllers
│   ├── event.controllers.ts               # Event management controllers
│   ├── feedback.controller.ts             # Feedback controllers
│   ├── invitation.controller.ts           # Invitation controllers
│   ├── notification.controllers.ts        # Notification controllers
│   ├── user.controllers.ts                # User management controllers
│   └── userstatis.controllers.ts          # User statistics controllers
│
├── models/                  # Database models
│   ├── user.models.ts       # User data model
│   ├── event.models.ts      # Event data model
│   ├── participant.models.ts # Event participant model
│   ├── invitation.model.ts  # Invitation data model
│   ├── discussionPost.model.ts # Discussion post model
│   ├── discussionReply.model.ts # Discussion reply model
│   ├── notification.models.ts # Notification data model
│   └── imageDiscussion.model.ts # Discussion image model
│
├── services/                # Business logic
│   ├── adminStatistics.service.ts # Admin statistics services
│   ├── auth.service.ts      # Authentication services
│   ├── discussionPost.service.ts # Discussion post services
│   ├── discussionReply.service.ts # Discussion reply services
│   ├── event.service.ts     # Event management services
│   ├── feedback.service.ts  # Feedback services
│   ├── imageUpload.service.ts # Image upload services
│   ├── invitation.service.ts # Invitation services
│   ├── notification.service.ts # Notification services
│   ├── otp.service.ts       # OTP verification services
│   ├── user.service.ts      # User management services
│   └── userstatis.service.ts # User statistics services
│
├── routes/                  # API routes
│   ├── admin/               # Admin routes
│   │   ├── admin.route.ts   # Main admin router
│   │   ├── eventManagement.admin.route.ts # Admin event management routes
│   │   └── userManagement.admin.route.ts  # Admin user management routes
│   ├── adminStatistics.routes.ts # Admin statistics routes
│   ├── auth.routes.ts       # Authentication routes
│   ├── discussionPost.routes.ts # Discussion post routes
│   ├── discussionReply.routes.ts # Discussion reply routes
│   ├── event.routes.ts      # Event management routes
│   ├── feedback.routes.ts   # Feedback routes
│   ├── invitation.routes.ts # Invitation routes
│   ├── notification.routes.ts # Notification routes
│   ├── user.routes.ts       # User management routes
│   ├── userStatisRoutes.ts  # User statistics routes
│   └── index.ts             # Route aggregator
│
├── middlewares/             # Express middlewares
│   ├── auth.middleware.ts   # Authentication middleware
│   ├── checkEventParticipant.middleware.ts # Event participant verification
│   ├── checkImageAccess.middleware.ts     # Image access control
│   ├── checkReplyParticipant.middleware.ts # Reply participant verification
│   ├── error.middlewares.ts # Error handling middleware
│   ├── oneUser.middleware.ts # User verification middleware
│   ├── requestTrimming.ts   # Request data trimming
│   └── validation.middleware.ts # Request validation middleware
│
├── interfaces/              # TypeScript interfaces
│   ├── adminStatistics.interfaces.ts # Admin statistics interfaces
│   ├── authenticationRequest.interface.ts # Auth request interfaces
│   ├── discussionPost.interfaces.ts # Discussion post interfaces
│   ├── discussionReply.interfaces.ts # Discussion reply interfaces
│   ├── event.interfaces.ts  # Event-related interfaces
│   ├── imageDiscussion.interfaces.ts # Discussion image interfaces
│   ├── notification.interfaces.ts # Notification interfaces
│   ├── participant.interfaces.ts # Participant interfaces
│   └── user.interfaces.ts   # User-related interfaces
│
├── validation/              # Joi validation schemas
│   ├── adminStatistics.validation.ts # Admin statistics validation
│   ├── auth.validation.ts   # Authentication validation schemas
│   ├── discussionImage.validation.ts # Discussion image validation
│   ├── discussionPost.validation.ts # Discussion post validation
│   ├── discussionReply.validation.ts # Discussion reply validation
│   ├── event.validation.ts  # Event validation schemas
│   ├── invitation.validation.ts # Invitation validation
│   ├── notification.validation.ts # Notification validation
│   ├── rsvp.validation.ts   # RSVP validation
│   ├── user.validation.ts   # User validation schemas
│   └── userstatis.validation.ts # User statistics validation
│
├── helpers/                 # Utility functions
│   ├── httpError.helpers.ts # HTTP error helpers
│   └── validateInput.ts     # Input validation helpers
│
├── enums/                   # Enumeration types
│   ├── errorCode.enums.ts   # Error code enumerations
│   ├── statusCode.enums.ts  # HTTP status code enumerations
│   └── participationStatus.enums.ts # Participation status enumerations
│
├── cron/                    # Scheduled tasks
│   ├── action/              # Cron job actions
│   │   └── commonActions.ts # Common cron job actions
│   ├── jobs/                # Cron job definitions
│   ├── cronConfig.ts        # Cron configuration
│   └── cronManager.ts       # Cron job manager
│
├── database/                # Database configuration
│   └── mongodb.ts           # MongoDB connection setup
│
├── email/                   # Email templates and services
│
├── uploads/                 # Temporary file storage for uploads
│
├── public/                  # Static files served by Express
│
└── types/                   # Custom type definitions
```

## Environment Variables

The project uses the following environment variables:

```
# Server Configuration
NODE_ENV=development  # or production
PORT=5001

# MongoDB Configuration
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1y

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Development vs Production

The application uses nearly identical configuration for both development and production environments, with the only difference being the `NODE_ENV` setting. In a production environment, it's recommended to:

1. Use environment variables instead of .env files
2. Store sensitive credentials in a secure secrets management service
3. Use different credentials for development and production
4. Consider shorter JWT expiration times with refresh token implementation

## API Endpoints

The backend provides the following API endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/verify-otp` - Verify OTP for registration
- `POST /api/auth/resend-otp` - Resend OTP for verification

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/statistics` - Get user statistics

### Event Management

- `POST /api/events` - Create a new event
- `GET /api/events` - Get all public events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event details
- `DELETE /api/events/:id` - Delete an event
- `GET /api/events/user` - Get user's events

### Invitation Management

- `POST /api/invitations` - Send event invitations
- `GET /api/invitations` - Get user's invitations
- `PUT /api/invitations/:id` - Respond to invitation (accept/decline)
- `GET /api/invitations/event/:eventId` - Get event invitations

### Discussion Board

- `POST /api/discussions/posts` - Create a discussion post
- `GET /api/discussions/posts/event/:eventId` - Get event discussion posts
- `PUT /api/discussions/posts/:id` - Update a discussion post
- `DELETE /api/discussions/posts/:id` - Delete a discussion post
- `POST /api/discussions/replies` - Create a reply to a post
- `GET /api/discussions/replies/post/:postId` - Get replies for a post
- `PUT /api/discussions/replies/:id` - Update a reply
- `DELETE /api/discussions/replies/:id` - Delete a reply

### Notification Management

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete a notification

### Admin Routes

- `GET /api/admin/statistics` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/events` - Get all events (admin view)
- `PUT /api/admin/events/:id` - Update event (admin privileges)
- `DELETE /api/admin/events/:id` - Delete event (admin privileges)
- `GET /api/admin/users` - Get all users (admin view)
- `PUT /api/admin/users/:id` - Update user (admin privileges)
- `DELETE /api/admin/users/:id` - Delete user (admin privileges)

## Admin Panel Features

The admin panel provides comprehensive management capabilities:

### User Management

- View all registered users
- Filter and search users
- Edit user details and roles
- Disable or delete user accounts
- Reset user passwords

### Event Management

- View all events (public and private)
- Filter and search events
- Edit event details
- Cancel or delete events
- Manage event visibility

### System Statistics

- Total user count and active user metrics
- Total event count and active event metrics
- Discussion post and reply metrics
- User engagement statistics
- Weekly and monthly trend comparisons

### System Settings

- Configure maximum number of active events per user
- Set maximum number of invitations that can be sent
- Adjust notification settings
- Manage system-wide parameters

## Getting Started

### Prerequisites

Before setting up the Eventify backend, ensure you have the following installed:

- Node.js (version 14.0.0 or higher)
- npm (version 6.0.0 or higher) or yarn (version 1.22.0 or higher)
- MongoDB (version 4.0.0 or higher) or MongoDB Atlas account

### Installation

To set up the development environment for Eventify backend, follow these steps:

1. Clone the repository to your local machine:

    ```
    git clone https://github.com/ddl0620/group_project_fullstack_backend.git
    cd group_project_fullstack_backend
    ```

2. Install the required dependencies:

    ```
    npm install
    ```

3. Create a `.env.development.local` file in the root directory and add the environment variables as shown in the Environment Variables section.

4. Start the development server:
    ```
    npm run dev
    ```

### Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized production files in the `dist` directory, ready for deployment.

### Running in Production

To run the application in production mode:

1. Create a `.env.production.local` file with production environment variables
2. Build the application as described above
3. Start the production server:
    ```
    npm run start
    ```

## Third-Party Services Integration

### MongoDB Atlas

The application uses MongoDB Atlas as its database service. To set up your own MongoDB Atlas instance:

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access (username and password)
4. Whitelist your IP address or set to allow access from anywhere
5. Get your connection string and update the DB_URI environment variable

### Cloudinary

Cloudinary is used for image and media storage. To set up Cloudinary:

1. Create an account at [Cloudinary](https://cloudinary.com/)
2. Navigate to your dashboard to get your cloud name, API key, and API secret
3. Update the CLOUDINARY environment variables

### Email Service

The application uses a Gmail account for sending emails. To set up email functionality:

1. Create a Gmail account or use an existing one
2. Enable "Less secure app access" or create an app password
3. Update the EMAIL environment variables
