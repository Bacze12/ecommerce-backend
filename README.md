# E-commerce Backend

This is the backend for an e-commerce application. It provides APIs for user authentication, product management, cart management, order processing, and more.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Bacze12/ecommerce-backend.git
cd ecommerce-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

```plaintext
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommercer
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_password
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX=100
```

## Configuration

- **Environment Variables**: The application uses environment variables for configuration. Make sure to set the variables in the `.env` file as shown above.
- **Database**: The application uses MongoDB as the database. Ensure that MongoDB is running and the `MONGODB_URI` is correctly set in the `.env` file.

## Usage

To start the application in development mode:

```bash
npm run dev
```

To start the application in production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get the current user's information

### Products

- `GET /api/products`: Get a list of products
- `GET /api/products/:id`: Get a product by ID
- `POST /api/products`: Create a new product (admin only)
- `PUT /api/products/:id`: Update a product (admin only)
- `DELETE /api/products/:id`: Delete a product (admin only)

### Categories

- `GET /api/categories`: Get a list of categories

### Cart

- `GET /api/cart`: Get the current user's cart
- `POST /api/cart/items`: Add an item to the cart
- `PUT /api/cart/items/:itemId`: Update an item in the cart
- `DELETE /api/cart/items/:itemId`: Remove an item from the cart
- `DELETE /api/cart`: Clear the cart

### Orders

- `POST /api/orders`: Create a new order
- `GET /api/orders/my-orders`: Get the current user's orders
- `GET /api/orders/:id`: Get an order by ID
- `PUT /api/orders/:id/payment`: Update the payment status of an order
- `GET /api/orders/admin/all`: Get all orders (admin only)

## Error Handling

The application uses a centralized error handling middleware defined in `src/middlewares/error.middleware.js`. All routes and middleware consistently use this error handling middleware.

## Validation

The application uses `express-validator` and `Joi` for request payload validation. Validation rules are defined in `src/middlewares/validation.middleware.js` and applied to the relevant routes.

## Testing

The application uses `jest` and `supertest` for testing. To run the tests:

```bash
npm test
```

## Security

- **Environment Variables**: The `.env` file contains sensitive information such as `JWT_SECRET` and `SMTP_PASS`. It is added to `.gitignore` to prevent it from being committed to the repository.
- **Helmet Middleware**: The application uses the `helmet` middleware for setting HTTP headers.
- **Input Sanitization**: The application uses the `express-mongo-sanitize` middleware for input sanitization.
- **Rate Limiting**: The application uses the `express-rate-limit` middleware for rate limiting.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a pull request

## License

This project is licensed under the MIT License.
