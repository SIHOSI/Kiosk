const { Users } = require('../../models');

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

      if (user) {
        res
          .cookie('isAdmin', user.isAdmin, { httponly: true })
          .cookie('name', user.name, { httponly: true })
          .json({ message: '로그인 성공', user });
      } else {
        res.status(401).json({ message: '로그인 실패' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: '로그인 오류' });
    }
  };
}

module.exports = AuthController;
