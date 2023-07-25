const { Users } = require('../models');

const isAdmin = async (req, res, next) => {
  try {
    const { isAdmin, name } = req.cookies;

    if (!isAdmin) {
      return res.status(401).json({
        errorMessage: '관리자만 이용가능.',
      });
    }

    const user = await Users.findOne({ where: { name } });

    res.locals.user = user;

    next();
  } catch (error) {
    console.log('🚀 ~ file: auth-middleware.js:18 ~ isAdmin ~ error:', error);
    res.status(500).json({ message: '미들웨어 오류' });
  }
};

module.exports = isAdmin;
