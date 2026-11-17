import express from 'express';
import { connectDB } from './config/database';
import app from './routes';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(\ChangeFlow API running on http://localhost:\\);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

