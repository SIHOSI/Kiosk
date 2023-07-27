const {
  OrderItems,
  Orders,
  Products,
  Options,
  OrderOptions,
} = require('../models');

// 상품 옵션 추가 API 컨트롤러
async function addOrderOption(req, res) {
  try {
    const { productName, quantity, extraPrice, shotPrice, hot } = req.body;

    // 상품이 존재하는지 확인
    const product = await Products.findOne({ where: { productName } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }

    // 옵션 추가
    const productOption = await Options.create({
      ProductId: product.productId,
      extraPrice,
      shotPrice,
      hot,
    });

    const productOptionId = await Options.findOne({
      where: { optionId: productOption.optionId },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '서버 오류입니다.' });
  }
}

module.exports = {
  addOrderOption,
};
