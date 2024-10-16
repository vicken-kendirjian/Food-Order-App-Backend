**Overview**
The Food Order App backend provides all the necessary functionalities to manage users (vendors and customers), food items, and orders. Vendors can add and update their product listings, while customers can browse available items, place orders, and track them. This backend handles authentication, order processing, and communication between customers and vendors.

**Features**
Vendor management: Vendors can register, log in, and manage their food items (add, edit, delete).
Customer management: Customers can register, log in, browse food items, place orders, and track their order status.
Order management: Customers can place orders, which are then handled by vendors.
Authentication & Authorization: Secure authentication for both vendors and customers using JWT.
Database: MongoDB is used to store data for users, products, and orders.

**Technologies Used**
TypeScript: Strongly typed JavaScript for robust code.
Node.js: Server-side runtime environment.
Express.js: Web framework for building the API.
MongoDB: NoSQL database for storing user, product, and order data.
Mongoose: Object Data Modeling (ODM) library for MongoDB.
JWT (JSON Web Tokens): For secure authentication.
