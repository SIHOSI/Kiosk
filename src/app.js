const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 3000;

const authRouter = require('./routes/authRoutes.js');
const adminRouter = require('./routes/adminRoutes.js');
const casheRouter = require('./routes/cacheRoutes.js');
const userRouter = require('./routes/userRoutes.js');

app.use(express.json());
app.use(cookieParser());

app.use('/api', [authRouter, casheRouter, adminRouter, userRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열림');
});
