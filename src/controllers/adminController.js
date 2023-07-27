const { Products, ProductOrders, Options, sequelize } = require('../../models');
const {
  cacheOptionsData,
  optionsCache,
} = require('../controllers/cacheController');

class AdminController {
  addProduct = async (req, res) => {
    try {
      const { name, price, stock, type } = req.body;

      if (!name) {
        return res.status(400).json({ message: '이름을 입력해주세요' });
      }

      if (!price) {
        return res.status(400).json({ message: '가격을 입력해주세요' });
      }

      if (!stock) {
        return res.status(400).json({ message: '재고를 입력해주세요' });
      }

      if (!type) {
        return res.status(400).json({ message: '타입을 입력해주세요' });
      }

      if (!['coffee', 'juice', 'food'].includes(type)) {
        return res.status(400).json({ message: '올바른 타입을 지정해주세요' });
      }

      const product = await Products.create({
        productName: name,
        price,
        stock,
        type,
      });

      res.status(201).json({ message: '상품 추가 성공', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 추가 오류' });
    }
  };

  // 상품 전체 리스트 조회
  getAllProducts = async (req, res) => {
    try {
      const products = await Products.findAll();
      const productIds = products.map((product) => product.productId);

      // 캐시된 옵션 데이터 사용
      const cachedOptions = optionsCache.get('options');
      const options = cachedOptions
        ? cachedOptions.filter((option) =>
            productIds.includes(option.ProductId)
          )
        : await Options.findAll({ where: { ProductId: productIds } });

      // 상품 리스트와 옵션 리스트를 합쳐서 결과로 반환
      const productsWithOption = products.map((product) => {
        const productOption = options.filter(
          (option) => option.ProductId === product.productId
        );
        return { ...product.toJSON(), options: productOption };
      });

      res.status(200).json(productsWithOption);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 조회 오류' });
    }
  };

  // 타입별 상품 조회
  getProductsByType = async (req, res) => {
    try {
      const { type } = req.params;
      if (!['coffee', 'juice', 'food'].includes(type)) {
        return res.status(400).json({ message: '올바른 타입을 지정해주세요' });
      }

      // 타입별 상품 리스트 조회
      const products = await Products.findAll({ where: { type } });

      // 각 상품별 옵션 리스트 조회
      const productIds = products.map((product) => product.productId);

      // 캐시된 옵션 데이터 사용
      const cachedOptions = optionsCache.get('options');
      const options = cachedOptions
        ? cachedOptions.filter((option) =>
            productIds.includes(option.ProductId)
          )
        : await Options.findAll({ where: { ProductId: productIds } });

      // 상품 리스트와 옵션 리스트를 합쳐서 결과로 반환
      const productsWithOption = products.map((product) => {
        const productOption = options.filter(
          (option) => option.ProductId === product.productId
        );
        return { ...product.toJSON(), options: productOption };
      });

      res.status(200).json(productsWithOption);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 조회 오류' });
    }
  };

  // 상품 삭제 API - 1차 API
  deleteProduct = async (req, res) => {
    try {
      const { productName } = req.params;

      console.log(
        '🚀 ~ file: adminController.js:75 ~ AdminController ~ deleteProduct ~ productName:',
        productName
      );

      const product = await Products.findOne({ where: { productName } });

      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      if (product.stock > 0) {
        // 상품 수량이 남아있는 경우, 1차 API
        return res.status(200).json({
          message: '현재 수량이 남아있습니다. 삭제하시겠습니까?',
          confirm: true,
        });
      }

      // 상품 수량이 없는 경우, 바로 삭제
      await product.destroy();
      res.status(200).json({ message: '상품을 삭제하였습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 삭제 오류' });
    }
  };

  // 상품 삭제 API - 2차 API
  confirmDeleteProduct = async (req, res) => {
    try {
      const { productName } = req.params;
      const product = await Products.findOne({ where: { productName } });

      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      const { confirm } = req.body;

      if (confirm === '예') {
        await product.destroy();
        res.status(200).json({ message: '상품을 삭제하였습니다.' });
      } else if (confirm === '아니오') {
        res.status(200).json({ message: '상품 삭제를 취소하였습니다.' });
      } else {
        res.status(400).json({ message: '예, 아니오로만 답해주세요.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 삭제 오류' });
    }
  };

  // 상품 수정 API
  updateProduct = async (req, res) => {
    try {
      const { productName } = req.params;
      const { name, price } = req.body;

      // 상품명(name)이 없을 경우
      if (!name) {
        return res.status(400).json({ message: '이름을 입력해주세요' });
      }

      // 가격(price)이 음수일 경우
      if (price < 0) {
        return res.status(400).json({ message: '알맞은 가격을 입력해주세요' });
      }

      const product = await Products.findOne({ where: { productName } });

      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      await product.update({ productName: name, price });
      res.status(200).json({ message: '상품 정보가 수정되었습니다.', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 수정 오류' });
    }
  };

  // 상품 발주 API
  addProductOrder = async (req, res) => {
    try {
      const { productName } = req.params;
      const { quantity } = req.body;

      const product = await Products.findOne({ where: { productName } });
      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      const productOrder = await ProductOrders.create({
        ProductId: product.productId,
        state: 'ORDERED',
        quantity,
      });

      res.status(201).json({ message: '상품 발주 성공', productOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '상품 발주 오류' });
    }
  };

  // 발주 상태 수정 API
  updateProductOrderState = async (req, res) => {
    try {
      const { productOrderId } = req.params;
      const { state } = req.body;

      // 발주 내역 조회
      const productOrder = await ProductOrders.findOne({
        where: { productOrderId },
        include: { model: Products },
      });

      if (!productOrder) {
        return res
          .status(404)
          .json({ message: '해당 발주 내역을 찾을 수 없습니다.' });
      }

      const currentState = productOrder.state;
      const productId = productOrder.ProductId;

      if (currentState === 'ORDERED' && state === 'PENDING') {
        // Ordered -> Pending
        await productOrder.update({ state });
        res
          .status(200)
          .json({ message: '발주 상태가 수정되었습니다.', productOrder });
      } else if (
        (currentState === 'ORDERED' || currentState === 'PENDING') &&
        state === 'CANCELED'
      ) {
        // Ordered or Pending -> Canceled
        await productOrder.update({ state });
        res
          .status(200)
          .json({ message: '발주 상태가 수정되었습니다.', productOrder });
      } else if (currentState === 'PENDING' && state === 'COMPLETED') {
        // Pending -> Completed
        const product = await Products.findOne({ where: { productId } });
        if (!product) {
          return res
            .status(404)
            .json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        // 트랜잭션 시작
        const t = await sequelize.transaction();

        try {
          // 발주 상태 변경 (Pending -> Completed)
          await productOrder.update({ state }, { transaction: t });

          // 상품의 수량 증가
          const orderedQuantity = productOrder.quantity;
          await product.increment('stock', {
            by: orderedQuantity,
            transaction: t,
          });
          // sequelize 문서에서
          // instance.increment(['number', 'count'], { by: 2 }) // increment number and count by 2

          // 트랜잭션 커밋
          await t.commit();

          res
            .status(200)
            .json({ message: '발주 상태가 수정되었습니다.', productOrder });
        } catch (error) {
          // 트랜잭션 롤백
          await t.rollback();
          throw error;
        }
      } else if (
        currentState === 'COMPLETED' &&
        (state === 'CANCELED' || state === 'PENDING' || state === 'ORDERED')
      ) {
        // Completed -> Canceled or Pending or Ordered
        const product = await Products.findOne({ where: { productId } });
        if (!product) {
          return res
            .status(404)
            .json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        // 트랜잭션 시작
        const t = await sequelize.transaction();

        try {
          // 발주 상태 변경 (Completed -> Canceled or Pending or Ordered)
          await productOrder.update({ state }, { transaction: t });

          // 상품의 수량 감소
          const orderedQuantity = productOrder.quantity;
          await product.decrement('stock', {
            by: orderedQuantity,
            transaction: t,
          });

          // 트랜잭션 커밋
          await t.commit();

          res
            .status(200)
            .json({ message: '발주 상태가 수정되었습니다.', productOrder });
        } catch (error) {
          // 트랜잭션 롤백
          await t.rollback();
          throw error;
        }
      } else {
        res.status(400).json({ message: '올바른 상태 변경을 입력해주세요.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '발주 상태 수정 오류' });
    }
  };

  // 옵션 추가 API
  addOption = async (req, res) => {
    try {
      const { productName } = req.params;
      const { extraPrice, shotPrice, hot } = req.body;

      const product = await Products.findOne({ where: { productName } });
      if (!product) {
        return res
          .status(404)
          .json({ message: '해당 상품을 찾을 수 없습니다.' });
      }

      // 옵션 추가
      const option = await Options.create({
        ProductId: product.productId,
        extraPrice,
        shotPrice,
        hot,
      });

      // 옵션 추가 완료 후, 옵션 데이터를 메모리에 갱신
      await cacheOptionsData();

      res.status(201).json({ message: '옵션 추가 성공', product, option });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '옵션 추가 오류' });
    }
  };

  // 옵션 수정 API
  updateOption = async (req, res) => {
    try {
      const { productName } = req.params;
      const { extraPrice, shotPrice, hot } = req.body;

      const product = await Products.findOne({ where: { productName } });

      // 옵션 조회
      const option = await Options.findOne({
        where: { productId: product.productId },
      });

      if (!option) {
        return res
          .status(404)
          .json({ message: '해당 옵션을 찾을 수 없습니다.' });
      }

      // 옵션 정보 업데이트
      await option.update({ extraPrice, shotPrice, hot });

      // 옵션 수정 완료 후, 옵션 데이터를 메모리에 갱신
      await cacheOptionsData();

      res.status(200).json({ message: '옵션 정보가 수정되었습니다.', option });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '옵션 수정 오류' });
    }
  };

  // 옵션 삭제 API
  deleteOption = async (req, res) => {
    try {
      const { productName } = req.params;

      const product = await Products.findOne({ where: { productName } });

      // 옵션 조회
      const option = await Options.findOne({
        where: { productId: product.productId },
      });

      if (!option) {
        return res
          .status(404)
          .json({ message: '해당 옵션을 찾을 수 없습니다.' });
      }

      // 옵션 삭제
      await option.destroy();

      // 옵션 삭제 완료 후, 옵션 데이터를 메모리에 갱신
      await cacheOptionsData();

      res.status(200).json({ message: '옵션을 삭제하였습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '옵션 삭제 오류' });
    }
  };
}

module.exports = AdminController;
