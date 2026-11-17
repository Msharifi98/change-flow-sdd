import express from 'express';
import requestsRouter from './requests';

const app = express();

app.use(express.json());
app.use('/api', requestsRouter);

export default app;


