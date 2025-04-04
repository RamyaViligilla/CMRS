import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/routes';

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('GET /users', () => {
  it('should return a list of users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });
});
