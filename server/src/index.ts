// src/index.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes';
import connectDB from './config/db';

const app = express();
const port = 3500;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Routes
app.use('/', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
