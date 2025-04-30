const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const customizationRoutes = require('./routes/customization');
const userRoutes = require('./routes/user');
const visitorRoutes = require('./routes/visitor');
const chatRoutes = require('./routes/chats');
const ticketRoutes = require('./routes/ticket');
const analyticsRoute = require('./routes/analytics');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    console.log(`Headers:`, req.headers);
    console.log(`Body:`, req.body);
    next();
});

// app.use(authMiddleware); // Apply auth middleware globally
app.use('/api/auth', authRoutes);
app.use('/api/customization', customizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoute);
app.use((req, res, next) => {
    console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
    next();
  });
app.use(errorHandler); // Apply error handling middleware globally

app.get("/", (req, res, next) => {
    try {
        res.send("Hello World!");
    } catch (err) {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("MongoDB connected");
    }).catch((err) => {
        console.log(err);
    });
});
