# 🛒 FR Grocery API Documentation

> **Base URL:** `http://localhost:3001` (Development) | `https://grocery-app.my.id` (Production)
>
> **Version:** 1.0.0

---

## 📑 Table of Contents

1. [Authentication](#-authentication)
2. [User Management](#-user-management)
3. [Products](#-products)
4. [Shopping Cart](#-shopping-cart)
5. [Checkout & Payment](#-checkout--payment)
6. [Addresses](#-addresses)
7. [Wishlist](#-wishlist)
8. [Reviews](#-reviews)
9. [Coupons](#-coupons)
10. [Chat & Messages](#-chat--messages)
11. [Admin Panel](#-admin-panel)
12. [Statistics (Admin)](#-statistics-admin)
13. [Error Responses](#-error-responses)

---

## 🔐 Authentication

### Headers

Most endpoints require authentication via JWT token:

```
Authorization: Bearer <access_token>
```

### Token Management

The API uses a dual-token system:

- **Access Token:** Short-lived (10 minutes), sent in response body
- **Refresh Token:** Long-lived (2 days), stored in HTTP-only cookie

---

## 👤 User Management

### Register User

Creates a new user account and sends verification email.

```http
POST /api/register
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "mobile": "string"
}
```

**Response:**

```json
[
  {
    "message": "Register success, please check your email to verify your registration"
  }
]
```

| Status | Description             |
| ------ | ----------------------- |
| `200`  | Registration successful |
| `400`  | Missing required fields |
| `201`  | Email already exists    |

---

### Login

Authenticates user and returns access token.

```http
POST /api/login
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
[
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
]
```

> **📝 Note:** Sets `refresh_token` as HTTP-only cookie.

| Status | Description             |
| ------ | ----------------------- |
| `200`  | Login successful        |
| `400`  | Missing required fields |
| `401`  | Invalid password        |
| `404`  | User not found          |

---

### Logout

Logs out user and clears refresh token.

```http
PUT /api/logout
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "message": "Logout success"
  }
]
```

---

### Refresh Token

Generates new access token using refresh token cookie.

```http
GET /api/token
```

**Response:**

```json
[
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
]
```

| Status | Description     |
| ------ | --------------- |
| `200`  | Token refreshed |
| `401`  | Session expired |

---

### Verify Email

Verifies user email after registration.

```http
PUT /api/verify-email?token=<verification_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Email verification token |

**Response:**

```json
[
  {
    "message": "The user's email has verified successfully"
  }
]
```

---

### Get User Profile

Retrieves authenticated user's profile.

```http
GET /api/profile
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "id": "uuid",
    "username": "John Doe",
    "email": "john@example.com",
    "profile_picture": "url",
    "mobile": 628123456789,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  [
    {
      "id": "address_uuid",
      "address": "123 Main Street, City"
    }
  ]
]
```

---

### Edit User Profile

Updates user profile information.

```http
PUT /api/edit-profile
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "mobile": "string"
}
```

**Response:**

```json
[
  {
    "message": "Profile updated successfully"
  }
]
```

---

### Request Password Reset

Sends password reset email.

```http
POST /api/request-reset-password
```

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
[
  {
    "message": "We've sent a reset password email to your account, please check your inbox"
  }
]
```

---

### Reset Password

Resets user password with token from email.

```http
POST /api/reset-password
```

**Headers:** Password reset token verification required.

**Request Body:**

```json
{
  "reset_password": "string"
}
```

**Response:**

```json
[
  {
    "message": "Password was reseted successfully"
  }
]
```

---

### Get Total Users (Admin)

Retrieves total user count.

```http
GET /api/total-users
```

**Headers:** `Authorization: Bearer <admin_access_token>` _(Admin Required)_

---

## 🔗 OAuth

### Google OAuth

Initiates Google OAuth authentication flow.

```http
GET /auth/google
```

**Response:** Redirects to Google OAuth consent screen.

---

### Google OAuth Callback

Handles Google OAuth callback.

```http
GET /auth/google/callback
```

**Response:** Sets authentication cookies and redirects to frontend.

---

## 📦 Products

### Get All Products

Retrieves all available products.

```http
GET /api/all-products
```

**Response:**

```json
[
  {
    "id": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "name": "Fresh Apples",
    "sku": "APL-001",
    "price": 5.99,
    "detail": "Fresh red apples from local farms",
    "image": "https://...",
    "category": "Fruits",
    "sold": 150,
    "stock": 100,
    "discount_percentage": 10,
    "average_rating": 4.5
  }
]
```

---

### Get Products by Category

Retrieves products filtered by category.

```http
GET /api/product-by-category?category=<category_id>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | number | Yes | Category ID |

---

### Get Similar Products

Retrieves similar products based on category.

```http
GET /api/similar-product?category=<category_id>
```

---

### Get Best Deal Products

Retrieves products with highest discounts.

```http
GET /api/best-deal
```

---

### Get Product by ID

Retrieves single product details with reviews.

```http
GET /api/product-by-id?productID=<product_id>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productID` | string | Yes | Product UUID |

---

### Get Popular Products

Retrieves most sold products.

```http
GET /api/popular-products
```

---

### Get Initial Products

Retrieves initial products for homepage.

```http
GET /api/initial-products
```

---

### Load More Products

Retrieves additional products with pagination.

```http
GET /api/more-products?serial=<serial_number>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serial` | string | Yes | Product serial for pagination |

---

### Search Products

Searches products by keyword.

```http
GET /api/search-product?keyword=<search_term>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | Yes | Search keyword |

---

### Upload Product (Admin)

Creates new product listing.

```http
POST /api/upload-product
```

**Headers:**

- `Authorization: Bearer <admin_access_token>` _(Admin Required)_
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Product image |
| `name` | string | Yes | Product name |
| `sku` | string | Yes | Product SKU |
| `price` | number | Yes | Product price |
| `detail` | string | Yes | Product description |
| `category` | number | Yes | Category ID |
| `stock` | number | Yes | Stock quantity |

---

## 🛒 Shopping Cart

> **⚠️ All cart endpoints require authentication.**

### Get Shopping Cart

Retrieves user's shopping cart.

```http
GET /api/shopping-cart
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "id": "cart_item_uuid",
    "product_id": "product_uuid",
    "quantity": 2,
    "name": "Fresh Apples",
    "price": 5.99,
    "image": "https://...",
    "discount_percentage": 10,
    "final_price": 10.78
  }
]
```

---

### Add to Cart

Adds product to shopping cart.

```http
POST /api/add-to-cart
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

**Response:**

```json
[
  {
    "message": "The item has added to the cart"
  }
]
```

---

### Increase Cart Quantity

Increases item quantity by 1.

```http
PUT /api/increase-cart-quantity
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

---

### Decrease Cart Quantity

Decreases item quantity by 1. Removes item if quantity reaches 0.

```http
PUT /api/decrease-cart-quantity
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

---

### Delete Cart Item

Removes item from cart completely.

```http
DELETE /api/delete-cart-item
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

---

### Get Completed Orders

Retrieves user's completed orders.

```http
GET /api/completed-orders
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

---

### Get Upcoming Orders

Retrieves user's pending/upcoming orders.

```http
GET /api/upcoming-orders
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

---

### Get Order List (Admin)

Retrieves all orders for admin.

```http
GET /api/order-list
```

**Headers:** `Authorization: Bearer <admin_access_token>` _(Admin Required)_

---

## 💳 Checkout & Payment

### Create PayPal Order

Creates a PayPal payment order.

```http
POST /api/paypal/create-order
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "coupon_code": "SAVE10",
  "address_id": "uuid"
}
```

**Response:**

```json
{
  "order_id": "PAYPAL_ORDER_ID",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "captureUrl": "https://api.paypal.com/v2/checkout/orders/.../capture",
  "coupon_code": "SAVE10"
}
```

---

### Capture PayPal Order

Captures (completes) PayPal payment.

```http
POST /api/paypal/capture-order
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "order_id": "PAYPAL_ORDER_ID",
  "coupon_code": "SAVE10"
}
```

---

### Get Order Details

Retrieves order details.

```http
GET /api/get-order-details?order_id=<order_id>
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

---

## 📍 Addresses

> **⚠️ All address endpoints require authentication.**

### Get User Addresses

Retrieves all user addresses.

```http
GET /api/address
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "id": "address_uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "address": "123 Main Street, City, Country",
    "label": "Home"
  }
]
```

---

### Add New Address

Adds a new address using coordinates.

```http
POST /api/add-address
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "lat": -6.2088,
  "lng": 106.8456,
  "label": "Home"
}
```

> **📝 Note:** Address is resolved using OpenStreetMap Nominatim API.

**Response:**

```json
[
  {
    "message": "The address has successfully added to your account"
  }
]
```

---

### Delete Address

Removes an address from user account.

```http
DELETE /api/delete-address
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "address_id": "uuid"
}
```

---

## ❤️ Wishlist

> **⚠️ All wishlist endpoints require authentication.**

### Get Wishlist

Retrieves user's wishlist.

```http
GET /api/wishlist
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "id": "wishlist_item_uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "product_id": "product_uuid",
    "name": "Fresh Apples",
    "price": 5.99,
    "stock": 100,
    "image": "https://...",
    "discount_percentage": 10,
    "final_Price": "5.39"
  }
]
```

---

### Add to Wishlist

Adds product to wishlist.

```http
POST /api/add-to-wishlist
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

---

### Remove from Wishlist

Removes product from wishlist.

```http
DELETE /api/remove-from-wishlist
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid"
}
```

---

## ⭐ Reviews

### Get Product Reviews

Retrieves reviews for a product.

```http
GET /api/reviews?productID=<product_id>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productID` | string | Yes | Product UUID |

**Response:**

```json
[
  {
    "id": "review_uuid",
    "username": "John Doe",
    "comment": "Great product!",
    "rating": 5,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Submit Review

Submits a new product review.

```http
POST /api/submit-review
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Request Body:**

```json
{
  "product_id": "uuid",
  "comment": "Great quality product!",
  "rating": 5
}
```

**Response:**

```json
{
  "message": "Review submitted successfully"
}
```

---

## 🎟️ Coupons

### Get User Coupons

Retrieves available coupons for user.

```http
GET /api/coupons
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

**Response:**

```json
[
  {
    "coupon_code": "SAVE10",
    "discount_percentage": 10,
    "expired_on": "2024-12-31",
    "redeemed": false
  }
]
```

---

## 💬 Chat & Messages

### Start Conversation

Initiates a new conversation with support.

```http
POST /api/start-conversation
```

**Headers:** `Authorization: Bearer <access_token>` _(Required)_

### WebSocket Events

The chat system uses Socket.io for real-time messaging.

**Connection:**

```javascript
const socket = io("https://grocery-app.my.id", {
  withCredentials: true,
});
```

**Events:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Connection established |
| `join-room` | Client → Server | Join conversation room |
| `send-message` | Client → Server | Send message |
| `receive-message` | Server → Client | Receive message |

---

## 🔧 Admin Panel

### Register Admin

Creates a new admin account.

```http
POST /api/register-admin
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

---

### Admin Login

Authenticates admin user.

```http
POST /api/login-admin
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
[
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
]
```

---

### Refresh Admin Token

Generates new admin access token.

```http
GET /api/admin-token
```

---

## 📊 Statistics (Admin)

> **⚠️ All statistics endpoints require admin authentication.**

### Get Most Popular Products

Retrieves most popular products by sales.

```http
GET /api/most-popular-products
```

**Headers:** `Authorization: Bearer <admin_access_token>` _(Admin Required)_

---

### Get Monthly Revenue

Retrieves monthly revenue statistics.

```http
GET /api/monthly-revenue
```

**Headers:** `Authorization: Bearer <admin_access_token>` _(Admin Required)_

**Response:**

```json
[
  {
    "month": "December 2024",
    "monthly_revenue": "15000.00"
  }
]
```

---

### Get Popular Category

Retrieves most popular product category.

```http
GET /api/popular-category
```

**Headers:** `Authorization: Bearer <admin_access_token>` _(Admin Required)_

---

## ❌ Error Responses

All endpoints return errors in a consistent format:

```json
[
  {
    "message": "Error description"
  }
]
```

### Common HTTP Status Codes

| Status Code | Description                  |
| ----------- | ---------------------------- |
| `200`       | Success                      |
| `201`       | Created successfully         |
| `400`       | Bad request / Missing fields |
| `401`       | Unauthorized / Invalid token |
| `403`       | Forbidden / Access denied    |
| `404`       | Resource not found           |
| `500`       | Internal server error        |

---

## 🔒 Security Notes

1. **HTTPS Required:** Production endpoints require HTTPS for `secure` cookies.
2. **CORS:** API allows specific origins only.
3. **Rate Limiting:** Consider implementing rate limiting for production.
4. **Token Storage:** Access tokens should be stored in memory, not localStorage.

---

## 📞 Support

For API support or issues, contact: **frgrocery1@gmail.com**

---

_Last updated: December 2024_
