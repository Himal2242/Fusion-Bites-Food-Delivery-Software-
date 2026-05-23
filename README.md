<div align="center">

# 🍽️ FusionBites — Premium Food Delivery Platform

### *The food you love, delivered perfectly.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-FusionBites-FF6B00?style=for-the-badge&labelColor=1a1a2e)](https://fusion-bitess.netlify.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

A **full-stack**, production-ready food delivery web application built with **React 19**, **Firebase**, and **Tailwind CSS**. FusionBites features a complete order lifecycle — from browsing and cart management to real-time order tracking and multi-role dashboards for customers, restaurants, delivery partners, and admins.

<br/>

[🚀 Live Demo](https://fusion-bitess.netlify.app/) • [📋 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [⚡ Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td width="50%">

**🏠 Homepage — Hero Section**

<img src="Screenshots/Screenshot 2026-04-11 135406.png" alt="FusionBites Homepage" width="100%"/>

</td>
<td width="50%">

**🍕 Menu — Browse & Filter**

<img src="Screenshots/Screenshot 2026-04-11 135506.png" alt="Menu Page" width="100%"/>

</td>
</tr>
<tr>
<td width="50%">

**🛒 Cart — Order Summary**

<img src="Screenshots/Screenshot 2026-04-11 135721.png" alt="Cart Page" width="100%"/>

</td>
<td width="50%">

**🛡️ Admin — Control Center**

<img src="Screenshots/Screenshot 2026-04-11 135823.png" alt="Admin Dashboard" width="100%"/>

</td>
</tr>
</table>
</div>

---

## ✨ Features

### 🛍️ Customer Experience
- **Browse & Discover** — Explore restaurants and dishes by category (Burgers, Pizza, Sushi, Healthy, Desserts, Drinks)
- **Advanced Search & Filters** — Search for food with real-time filtering by category, price, and more
- **Product Details** — View full dish details including ingredients, add-ons, calories, prep time, and ratings
- **Smart Cart** — Add items, adjust quantities, and remove items with a sleek cart interface
- **Promo Codes & Coupons** — Apply discount codes at checkout (percentage or flat discounts)
- **Order Tracking** — Real-time order status tracking from placement to delivery
- **Order History** — View all past and current orders

### 🏪 Restaurant Partner Dashboard
- **Order Management** — Accept, prepare, and mark orders as ready for pickup
- **Product Management** — Upload and manage dishes/menu items with images, pricing, and details
- **Real-time Updates** — Live order feed with status management

### 🚴 Delivery Partner Dashboard
- **Pickup Queue** — View all orders ready for pickup
- **Delivery Flow** — Accept deliveries → Mark as Picked → On the Way → Delivered
- **Order Details** — Full customer and order information for each delivery

### 🛡️ Admin Control Center
- **Platform Analytics** — Real-time stats: total revenue, orders, users, and products
- **User Management** — View, suspend, reinstate, and promote all platform users
- **Partner Approvals** — Approve or reject Restaurant & Delivery Partner applications
- **Order Monitoring** — Track all network orders with status and customer details
- **Menu Seeding** — One-click seed menu data for testing and demo purposes

### 🔐 Authentication & Security
- **Email/Password Authentication** — Secure user registration and login
- **Google Social Login** — One-click sign-in with Google
- **Session Isolation** — Uses `browserSessionPersistence` so each browser tab has an independent session
- **Role-Based Access Control** — Protected routes based on user roles
- **Firestore Security Rules** — Granular read/write permissions per collection and user role

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| **Frontend** | React 19, JSX |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v7 |
| **Backend / BaaS** | Firebase (Auth + Firestore) |
| **Hosting** | Netlify |
| **Fonts** | Inter (Google Fonts) |

</div>

---

## 🏗️ Architecture

```
FusionBites/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and media
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation bar with role-aware links
│   │   └── ProtectedRoute.jsx  # Auth guard for protected pages
│   ├── context/
│   │   ├── AuthContext.jsx  # Firebase auth state management
│   │   └── CartContext.jsx  # Shopping cart state (add, remove, clear)
│   ├── pages/
│   │   ├── Home.jsx         # Landing page with hero & categories
│   │   ├── Menu.jsx         # Browse dishes with search & filters
│   │   ├── ProductDetail.jsx # Full product info, add-ons, reviews
│   │   ├── Cart.jsx         # Cart summary with promo code support
│   │   ├── Checkout.jsx     # Address, payment method, order placement
│   │   ├── CustomerOrders.jsx  # Order history for customers
│   │   ├── OrderTracking.jsx   # Real-time order status tracking
│   │   ├── Profile.jsx     # User profile & partner applications
│   │   ├── Login.jsx        # Email/password + Google login
│   │   ├── Signup.jsx       # New user registration
│   │   ├── AdminDashboard.jsx      # Superadmin control panel
│   │   ├── RestaurantDashboard.jsx # Restaurant order & menu management
│   │   └── DeliveryDashboard.jsx   # Delivery partner pickup & delivery
│   ├── firebase.js          # Firebase config & initialization
│   ├── App.jsx              # Root component with routes
│   ├── App.css              # Global styles
│   ├── index.css            # Tailwind directives
│   └── main.jsx             # React DOM entry point
├── index.html               # HTML entry point
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite build config
├── eslint.config.js         # ESLint configuration
└── package.json
```

---

## 👥 User Roles

FusionBites uses a **numeric role system** to manage permissions across the platform:

| Role | Value | Capabilities |
|:---|:---:|:---|
| **Customer** | `1` | Browse menu, add to cart, place orders, apply coupons, track orders, apply for partnerships |
| **Restaurant Partner** | `2` | Manage incoming orders (accept → prepare → ready), upload and edit dishes |
| **Delivery Partner** | `3` | View ready pickups, accept deliveries, update delivery status in real-time |
| **Superadmin** | `4` | Full platform control — approve partners, manage users, view analytics, seed data |

---

## 🔄 Order Lifecycle

```
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐    ┌────────────┐    ┌───────────┐
│  Placed  │───▶│ Confirmed │───▶│ Preparing │───▶│  Ready  │───▶│  Picked  │───▶│ On the Way │───▶│ Delivered │
└──────────┘    └───────────┘    └───────────┘    └─────────┘    └──────────┘    └────────────┘    └───────────┘
   Customer      Restaurant       Restaurant      Restaurant      Delivery        Delivery         Delivery
                                                                  Partner         Partner          Partner
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Firebase** project with Authentication and Firestore enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Himal2242/Fusion-Bites-Food-Delivery-Software-.git
cd Fusion-Bites-Food-Delivery-Software-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create or update `src/firebase.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 4. Set Up Firestore Security Rules

In your **Firebase Console → Firestore → Rules**, paste the following:

<details>
<summary>📋 Click to expand Firestore Rules</summary>

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: own data readable by self, all readable by admin
    match /users/{userId} {
      allow read: if request.auth != null &&
                    (request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 4);
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 4;
    }

    // Products: publicly readable, writable by restaurant owners and admins
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (resource.data.restaurantId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 4);
    }

    // Orders: readable/writable by authenticated users
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }

    // Coupons: publicly readable, writable by admins only
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 4;
    }

    // Categories: readable by all, writable by partners and admins
    match /categories/{catId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role >= 2;
    }

    // Reviews and vouchers
    match /reviews/{id} { allow read, write: if request.auth != null; }
    match /vouchers/{id} { allow read, write: if request.auth != null; }
  }
}
```

</details>

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

---

## 🗄️ Firestore Data Model

| Collection | Key Fields |
|:---|:---|
| `users/{uid}` | `fullName`, `email`, `role`, `status`, `loyaltyPoints`, `phone`, `profilePicture`, `requestedRole`, `createdAt` |
| `categories/{id}` | `name`, `createdBy`, `createdAt` |
| `restaurants/{id}` | `name`, `ownerId`, `address`, `cuisineType`, `image` |
| `products/{id}` | `name`, `price`, `categoryName`, `image`, `description`, `prepTime`, `restaurantId`, `restaurantName`, `ingredients[]`, `addOns[{name, price}]`, `calories`, `isVeg`, `popular`, `rating`, `reviews`, `createdAt` |
| `orders/{id}` | `userId`, `userName`, `items[]`, `status`, `address`, `paymentMethod`, `paymentStatus`, `totalAmount`, `discountApplied`, `couponCode`, `deliveryFee`, `taxes`, `restaurantId`, `driverId`, `driverName`, `createdAt`, `updatedAt` |
| `coupons/{id}` | `code`, `active`, `type` (percentage / flat), `value`, `maxDiscount`, `minOrder` |
| `reviews/{id}` | `userId`, `productId`, `rating`, `comment`, `createdAt` |
| `vouchers/{id}` | `userId`, `code`, `isUsed`, `discount` |

---

## 🚀 Deployment

This project is deployed on **Netlify**. To deploy your own instance:

1. **Build the project:**
   ```bash
   npm run build
   ```
2. **Deploy the `dist/` folder** to Netlify (drag-and-drop or connect your GitHub repo)
3. **Set environment variables** in Netlify if needed
4. **Configure redirects** — add a `_redirects` file in `public/` for SPA routing:
   ```
   /*    /index.html   200
   ```

---

## 🧑‍💻 Making Yourself Admin

To set up the initial admin account:

1. **Register** a new account on the platform
2. **Temporarily** set Firestore rules to allow all reads/writes
3. In **Firebase Console → Firestore**, find your user document under `users/{your-uid}`
4. **Set** the `role` field to `4`
5. **Restore** the proper security rules (see above)

---

## 📂 Key Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Built with ❤️ by [Himal2242](https://github.com/Himal2242)**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Himal2242-181717?style=for-the-badge&logo=github)](https://github.com/Himal2242)

</div>