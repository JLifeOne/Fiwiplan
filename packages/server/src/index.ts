import express from 'express';
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import aiRoutes from './routes/ai';
import taskRoutes from './routes/tasks';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
