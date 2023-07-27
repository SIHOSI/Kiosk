const { Users } = require('../../models');
const isAdmin = require('../middleware/isAdmin');

class AuthController {
  signup = async (req, res) => {
    try {
      const { name, password, isAdmin } = req.body;
      const user = await Users.create({ name, password, isAdmin });
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '회원가입 오류' });
    }
  };

  login = async (req, res) => {
    try {
      const { name, password } = req.body;
      const user = await Users.findOne({ where: { name, password } });

      if (!user) {
        res.status(401).json({ message: '로그인 실패' });
      } else {
        if (user.isAdmin === true) {
          res
            .cookie('isAdmin', user.isAdmin, { httponly: true })
            .cookie('name', user.name, { httponly: true })
            .json({ message: '관리자 로그인 성공', user });
        } else {
          res
            .cookie('name', user.name, { httponly: true })
            .json({ message: '유저 로그인 성공', user });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: '로그인 오류' });
    }
  };

  logout = async (req, res) => {
    try {
      res.locals.user = null;
      res.clearCookie('isAdmin');
      res.clearCookie('name');
      res.json({ message: '로그아웃 성공' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: '로그아웃 오류' });
    }
  };
}

module.exports = AuthController;
