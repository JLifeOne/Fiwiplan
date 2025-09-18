import express from 'express';
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import aiRoutes from './routes/ai';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
