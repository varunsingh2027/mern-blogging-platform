# 🚀 Modern MERN Stack Blogging Platform

A full-stack blogging platform built with MongoDB, Express.js, React, and Node.js. Features include user authentication, rich text editing, image uploads, comments, likes, and an admin dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Admin)
- Secure password hashing with bcrypt
- Protected routes

### 📝 Blog Management
- Rich text editor with React Quill
- Image upload with Cloudinary integration
- CRUD operations for blog posts
- Categories and tags system
- SEO-friendly URLs

### 💬 Social Features
- Comment system with nested replies
- Like/Unlike functionality
- User profiles with avatar upload
- Follow/Unfollow users

### 📊 Admin Dashboard
- User management
- Content moderation
- Analytics and statistics
- Bulk operations

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/Light theme support
- Loading states and error handling
- Progressive Web App (PWA) ready

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File upload handling

### Frontend
- **React 18** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Quill** - Rich text editor

### DevOps & Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Docker** - Containerization

## 🚀 Quick Start

### Prerequisites
- Node.js (>=18.0.0)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mern-blog-platform.git
   cd mern-blog-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Configure Environment Variables**
   
   **Server (.env)**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blog_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:3000
   ```
   
   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENVIRONMENT=development
   ```

5. **Start the application**
   ```bash
   # From root directory - starts both server and client
   npm run dev
   
   # Or start individually
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/profile     - Get user profile
PUT  /api/auth/profile     - Update user profile
```

### Blog Endpoints
```
GET    /api/blogs          - Get all blogs (with pagination)
POST   /api/blogs          - Create new blog (auth required)
GET    /api/blogs/:id      - Get single blog
PUT    /api/blogs/:id      - Update blog (auth required)
DELETE /api/blogs/:id      - Delete blog (auth required)
POST   /api/blogs/:id/like - Like/Unlike blog (auth required)
```

### Comment Endpoints
```
GET    /api/blogs/:id/comments     - Get blog comments
POST   /api/blogs/:id/comments     - Add comment (auth required)
PUT    /api/comments/:id           - Update comment (auth required)
DELETE /api/comments/:id           - Delete comment (auth required)
```

### Admin Endpoints
```
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id        - Update user role
DELETE /api/admin/users/:id        - Delete user
GET    /api/admin/analytics        - Get platform analytics
```

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test

# Run all tests
npm run test:all
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up --build
```

## 📁 Project Structure

```
mern-blog-platform/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   └── package.json
├── docs/                 # Documentation
├── .github/              # GitHub workflows
├── docker-compose.yml
└── package.json          # Root package.json
```

## 🔧 Development Scripts

```bash
# Root level commands
npm run dev          # Start both client and server
npm run server       # Start server only
npm run client       # Start client only
npm run build        # Build for production
npm run test:all     # Run all tests
npm run lint         # Lint all code
npm run format       # Format code with Prettier

# Server commands
npm run start        # Start production server
npm run dev          # Start development server
npm run test         # Run server tests
npm run lint         # Lint server code

# Client commands
npm run build        # Build for production
npm run test         # Run client tests
npm run eject        # Eject from Create React App
```

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Railway/Heroku (Backend)
1. Create new app on Railway/Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### MongoDB Atlas
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update MONGODB_URI in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cloudinary](https://cloudinary.com/) - Image management

## 📞 Support

If you have any questions or need help, please:
- Create an issue on GitHub
- Contact: your-email@example.com

---

⭐ Star this repository if you found it helpful!
