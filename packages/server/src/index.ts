import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import aiRoutes from './routes/ai';
import taskRoutes from './routes/tasks';
import budgetRoutes from './routes/budget';
import adRoutes from './routes/ads';
import adminRoutes from './routes/admin';
import userAdsRoutes from './routes/userAds';
import { PrismaClient } from '@prisma/client';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, you should restrict this to your app's domain
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user-ads', userAdsRoutes);

app.get('/api/messages/:planId', async (req, res) => {
  const { planId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { planId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, displayName: true } } },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('joinPlan', (planId) => {
    socket.join(planId);
    console.log(`Socket ${socket.id} joined plan ${planId}`);
  });

  socket.on('sendMessage', async ({ planId, userId, body }) => {
    try {
      const message = await prisma.message.create({
        data: {
          planId,
          userId,
          body,
        },
        include: { user: { select: { id: true, displayName: true } } },
      });
      io.to(planId).emit('newMessage', message);
    } catch (error) {
      console.error('Failed to save and broadcast message', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
