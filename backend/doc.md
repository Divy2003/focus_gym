
// API Documentation (README.md content)

# Gym Management System Backend

A comprehensive backend system for gym management with admin authentication, member management, diet plan creation, and analytics.

## Features

### Admin Authentication
- OTP-based login using Twilio
- JWT token authentication
- Fixed admin mobile number (seeded in database)

### Member Management
- Add members without login (public endpoint)
- Auto-approve if fees included, otherwise pending status
- Search and filter functionality
- Bulk operations (delete, send messages)
- Auto-calculate membership end date

### Diet Plan Management
- Create diet plans with PDF generation
- Store PDFs in Cloudinary
- Edit and delete diet plans
- Multiple meal planning with calorie tracking

### Analytics Dashboard
- Total members, approved, pending, expired counts
- Revenue tracking
- Monthly statistics
- Members expiring soon
- Status distribution charts

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gym_management
   JWT_SECRET=your_strong_jwt_secret
   ADMIN_MOBILE=+919876543210
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Start the server:
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

4. Seed admin data:
   ```bash
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to admin mobile
- `POST /api/auth/verify-otp` - Verify OTP and login

### Members
- `POST /api/members` - Add member (public, no auth)
- `GET /api/members` - Get all members with filters
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `POST /api/members/bulk-delete` - Bulk delete members
- `POST /api/members/send-message` - Send SMS to members

### Diet Plans
- `POST /api/diet` - Create diet plan
- `GET /api/diet` - Get all diet plans
- `GET /api/diet/:id` - Get single diet plan
- `PUT /api/diet/:id` - Update diet plan
- `DELETE /api/diet/:id` - Delete diet plan

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/expiring-members` - Members expiring soon

## Database Schema

### Admin
- mobile (unique)
- name
- otp (temporary)
- isActive

### Member
- name, mobile, joiningDate, endingDate
- month, fees, description
- status (pending/approved/expired)
- Auto-calculated ending date

### DietPlan
- title, targetAudience, meals, totalCalories
- duration, notes, pdfUrl
- createdBy (Admin reference)

## Key Features Implementation

1. **Auto Status Management**: Members with fees > 0 are auto-approved
2. **PDF Generation**: Diet plans converted to styled PDF using Puppeteer
3. **Cloud Storage**: PDFs stored in Cloudinary with auto-cleanup
4. **SMS Integration**: Bulk messaging using Twilio
5. **Search & Filter**: Full-text search on member names and mobile
6. **Analytics**: Comprehensive dashboard with charts data

## Security Features
- Helmet for security headers
- Rate limiting
- Input validation
- JWT authentication
- CORS configuration

## Dependencies
- Express.js for server framework
- MongoDB with Mongoose ODM
- Twilio for SMS/OTP
- Cloudinary for file storage
- Puppeteer for PDF generation
- JWT for authentication
- Handlebars for PDF templating

