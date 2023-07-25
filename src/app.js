const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 3000;

const authRouter = require('./routes/authRoutes.js');

app.use(express.json());
app.use(cookieParser());

app.use('/api', [authRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열림');
});
