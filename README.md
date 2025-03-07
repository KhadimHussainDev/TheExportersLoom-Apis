# 🚀 The Exporters Loom - Backend API

A powerful and scalable backend system for managing textile manufacturing orders, bids, and workflows. Built with **NestJS**, **PostgreSQL**, and **TypeScript** to ensure performance, security, and efficiency.

---

## 📚 Table of Contents
- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [🏗 Project Structure](#-project-structure)
- [🔑 API Endpoints](#-api-endpoints)
- [📦 Project Resources](#-project-resources)
- [🤝 Contribution Guidelines](#-contribution-guidelines)
- [📄 License](#-license)
- [👥 Contributors](#-contributors)
- [📞 Support](#-support)

---

## 🌟 Overview

The Exporters Loom is an intelligent platform that seamlessly connects **textile exporters** and **manufacturers**, simplifying order management, bidding, and the entire manufacturing process. 🚀

---

## ✨ Features

### 📦 Order Management System
✅ Create, update, and track orders in real-time.  
✅ Role-based access control (Exporters & Manufacturers).  
✅ Live order status tracking for better visibility.  

### 💰 Bidding System
✅ Place bids on textile manufacturing projects.  
✅ Accept or reject bids seamlessly.  
✅ Transparent bid tracking.  

### 🏭 Manufacturing Process Management
✅ Logo printing and fabric quantity calculation.  
✅ Cost estimation & packaging module.  
✅ Cutting, stitching, and process management.  

### ⚙️ Machine Management
✅ Monitor machine availability & allocate machines to orders.  
✅ Track machine status to avoid downtime.  
---

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** JWT

---

## 📋 Prerequisites

Before running this project, ensure you have:
- ✅ Node.js (v14 or higher)
- ✅ PostgreSQL
- ✅ npm or yarn

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/KhadimHussainDev/TheExportersLoom-Backend.git
   cd TheExportersLoom-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other configurations
   ```

4. **Run migrations**
   ```bash
   npm run migration:run
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

---

## 📂 Project Structure
```plaintext
src/
├── auth/            # Authentication Module
├── bid/             # Bidding System
├── chat/            # Chat Module
├── machines/        # Machine Management
├── order/           # Order Processing
├── users/           # User Management
├── common/          # Common utilities (decorators, guards, etc.)
├── config/          # Configuration files
├── app.module.ts    # Main module
└── main.ts          # Application entry point
```


---

## 🔑 API Endpoints

### 🔐 Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### 👥 Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### 📦 Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order

### 🎯 Bids
- `POST /bids` - Create new bid
- `GET /bids` - Get all bids
- `PUT /bids/:id/accept` - Accept bid

### 🏭 Machines
- `POST /machines` - Add new machine
- `GET /machines` - Get all machines

### 💬 Chat
- `POST /chat/rooms` - Create chat room
- `GET /chat/rooms` - Get all chat rooms

---

## 📦 Project Resources

- **Frontend Repository:** [Contribute Here](https://github.com/KhadimHussainDev/TheExportersLoom-Ui)
- **Demo Video:** [Watch Here](https://drive.google.com/file/d/1Pa70V1NkAB9ABVsBvDMd8JeUdB0WJri7/view)

---

## 🤝 Contribution Guidelines

We 💖 open-source contributions! Here’s how you can contribute:

1. **Fork the Repository** 🚀
2. **Clone Your Fork**
   ```sh
   git clone https://github.com/YOUR_USERNAME/TheExportersLoom-Backend.git
   ```
3. **Create a New Branch**
   ```sh
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes & Commit**
   ```sh
   git commit -m "✨ Add: Your amazing new feature"
   ```
5. **Push to GitHub & Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Contributors

- [Khadim Hussain](https://github.com/KhadimHussainDev)
- **You!** (Your name could be here 😉 – contribute now!)

---

## 📞 Support

Got questions? Need help? Feel free to reach out! 💌
- **Email:** [devKhadimHussain@gmail.com](mailto:devKhadimHussain@gmail.com)
- **GitHub Issues:** [Open an Issue](https://github.com/KhadimHussainDev/TheExportersLoom-Backend/issues)

