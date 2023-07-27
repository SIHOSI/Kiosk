const { Users, Orders, Products, OrderItems } = require('../../models');
const { optionsCache } = require('../controllers/cacheController');

class UserController {
  // 상품 주문 API
  createOrder = async (req, res) => {
    try {
      const { productName, quantity, extraPrice, shotPrice, hot } = req.body;

      // productName에 해당하는 상품 조회
      const product = await Products.findOne({
        where: { productName },
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      // 주문 아이템 생성
      const orderItem = await OrderItems.create({
        ProductId: product.productId,
        quantity,
        OrderId: null, // 초기값으로 null을 설정하여 orderId를 생성하기 전에 할당하도록 합니다.
      });

      // 로그인일 경우 회원 조회
      const user = req.cookies.user
        ? await Users.findOne({ where: { name: req.cookies.user } })
        : null;

      // 주문 아이템에 해당하는 주문 조회 (orderItem의 orderId를 기다렸다가 조회)
      let order = await Orders.findOne({
        where: { orderId: orderItem.OrderId },
      });

      if (!order) {
        // 없으면 주문 생성
        order = await Orders.create({
          UserId: user ? user.userId : null,
          orderState: 'ORDERED', // 주문 상태 초기값은 ORDERED
        });

        // 주문 아이템에 생성한 주문 ID 할당
        await orderItem.update({ OrderId: order.orderId });
      }

      await orderItem.update({ OrderId: order.orderId });

      // 옵션 정보 가져오기 (캐싱된 정보 활용)
      const cachedOptions = optionsCache.get('options');
      const productOptions = cachedOptions
        ? cachedOptions.find((option) => option.ProductId === product.productId)
        : null;

      console.log(
        '🚀 ~ file: userController.js:54 ~ UserController ~ createOrder= ~ productOptions:',
        productOptions
      );

      // 최종 음식값 계산
      let finalPrice = product.price;
      if (productOptions) {
        if (extraPrice) finalPrice += productOptions.extraPrice;
        if (shotPrice) finalPrice += productOptions.shotPrice;
      }

      finalPrice += product.price * quantity;

      res.status(201).json({
        message: '상품 주문 성공',
        productName: product.productName,
        quantity,
        finalPrice,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 주문 오류' });
    }
  };
}

module.exports = UserController;
