const { Orders, Products, OrderItems } = require('../models');

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
        extraPrice,
        shotPrice,
        hot,
      });

      // 주문 아이템에 해당하는 주문 조회
      let order = await Orders.findOne({
        where: { orderId: orderItem.OrderId },
      });

      if (!order) {
        // 주문 생성
        order = await Orders.create({
          UserId: null, // 사용자 ID (만약 사용자 인증 기능이 있다면 해당 유저의 ID를 넣어줄 수 있습니다)
          orderState: 'ORDERED', // 주문 상태 초기값은 ORDERED
        });

        // 주문 아이템에 생성한 주문 ID 할당
        await orderItem.update({ OrderId: order.orderId });
      }

      res.status(201).json({ message: '상품 주문 성공' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 주문 오류' });
    }
  };
}

module.exports = UserController;
