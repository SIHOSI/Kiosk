const {
  Users,
  Orders,
  Products,
  OrderItems,
  sequelize,
} = require('../../models');
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
        OrderId: req.cookies.orderId || null, // 쿠키에 저장된 주문 ID 사용 (비회원의 경우)
      });

      // 로그인일 경우 조회 아닐 경우 null
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
          UserId: user ? user.userId : null, //비로그인 유저는 null로
          orderState: 'ORDERED', // 주문 상태 초기값은 ORDERED
        });

        // 주문 아이템에 생성한 주문 ID 할당
        await orderItem.update({ OrderId: order.orderId });

        // 주문 ID를 쿠키에 저장 (비회원의 경우)
        if (!user) {
          res.cookie('orderId', order.orderId, { httponly: true });
        }
      } else {
        // 기존 주문에 주문 아이템 추가
        await orderItem.update({ OrderId: order.orderId });
      }

      // 옵션 정보 가져오기 (캐싱된 정보 활용)
      const cachedOptions = optionsCache.get('options');
      const productOptions = cachedOptions
        ? cachedOptions.find((option) => option.ProductId === product.productId)
        : null;

      if (productOptions.hot !== true && hot === true)
        throw new Error('hot 옵션을 선택할 수 없습니다.');

      // 최종 음식값 계산
      let finalPrice = product.price * quantity;
      if (productOptions) {
        if (
          productOptions.extraPrice !== 0 &&
          extraPrice % productOptions.extraPrice === 0
        ) {
          finalPrice += extraPrice * quantity;
        } else if (productOptions.extraPrice !== 0 && extraPrice !== 0) {
          throw new Error('잘못된 사이즈 옵션 선택');
        }

        if (
          productOptions.shotPrice !== 0 &&
          shotPrice % productOptions.shotPrice === 0
        ) {
          finalPrice += shotPrice * quantity;
        } else if (productOptions.shotPrice !== 0 && shotPrice !== 0) {
          throw new Error('잘못된 샷 옵션 선택');
        }
      }

      res.status(201).json({
        message: '상품 주문 성공',
        productName: product.productName,
        quantity,
        finalPrice,
        hot,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: '상품 주문 오류', error: error.message });
    }
  };

  // 주문 완료 API
  completeOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Orders.findOne({
        where: { orderId },
        include: { model: OrderItems },
      });

      if (!order) {
        return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
      }

      if (order.orderState === 'COMPLETED') {
        return res
          .status(400)
          .json({ message: '이미 완료된 주문은 취소할 수 없습니다.' });
      }

      // 트랜잭션으로 주문 처리 완료
      await sequelize.transaction(async (t) => {
        await order.update({ orderState: 'COMPLETED' }, { transaction: t });
      });

      // 주문에 속한 모든 OrderItems 가져오기
      const orderItems = order.OrderItems;

      // 각 OrderItems의 최종 가격을 계산하고 모든 가격을 합산
      let totalOrderPrice = 0;
      for (const orderItem of orderItems) {
        const product = await Products.findByPk(orderItem.ProductId);
        const cachedOptions = optionsCache.get('options');
        const productOptions = cachedOptions
          ? cachedOptions.find(
              (option) => option.ProductId === product.productId
            )
          : null;

        let finalPrice = product.price * orderItem.quantity;
        if (productOptions) {
          if (
            productOptions.extraPrice !== 0 &&
            orderItem.extraPrice % productOptions.extraPrice === 0
          ) {
            finalPrice += orderItem.extraPrice * orderItem.quantity;
          }

          if (
            productOptions.shotPrice !== 0 &&
            orderItem.shotPrice % productOptions.shotPrice === 0
          ) {
            finalPrice += orderItem.shotPrice * orderItem.quantity;
          }
        }

        totalOrderPrice += finalPrice;
      }

      return res.status(200).json({
        message: '주문 처리 완료',
        order,
        orderItems,
        totalOrderPrice,
      });
    } catch (error) {
      console.log(error);
      await t.rollback(); // 실패 시 트랜잭션 롤백
      res.status(500).json({ message: '주문 처리 오류', error: error.message });
    }
  };

  // 주문 취소 API
  cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Orders.findOne({
        where: { orderId },
      });

      if (!order) {
        return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
      }

      if (order.orderState === 'COMPLETED') {
        return res
          .status(400)
          .json({ message: '완료된 주문은 취소할 수 없습니다.' });
      }

      // 트랜잭션으로 주문 취소 처리
      await sequelize.transaction(async (t) => {
        // 주문 아이템 삭제
        await OrderItems.destroy({
          where: { OrderId: order.orderId },
          transaction: t,
        });

        // 주문 취소로 상태 변경
        await order.update({ orderState: 'CANCELED' }, { transaction: t });
      });

      return res.status(200).json({ message: '주문 취소 완료' });
    } catch (error) {
      console.log(error);
      await t.rollback(); // 실패 시 트랜잭션 롤백
      res.status(500).json({ message: '주문 취소 오류', error: error.message });
    }
  };
}

module.exports = UserController;
