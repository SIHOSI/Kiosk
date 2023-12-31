const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const adminController = new AdminController();
const isAdminMiddleware = require('../middleware/isAdmin');

// 상품 추가
router.post('/products', isAdminMiddleware, adminController.addProduct);

// 옵션 추가
router.post(
  '/products/:productName/options',
  isAdminMiddleware,
  adminController.addOption
);

// 옵션 수정
router.patch(
  '/products/:productName/options',
  isAdminMiddleware,
  adminController.updateOption
);

// 옵션 삭제
router.delete(
  '/products/:productName/options',
  isAdminMiddleware,
  adminController.deleteOption
);

// 상품 전체 리스트 조회
router.get('/products', adminController.getAllProducts);

// 타입별 상품 조회
router.get('/products/:type', adminController.getProductsByType);

// 상품 삭제 - 1차 API
router.delete(
  '/products/:productName',
  isAdminMiddleware,
  adminController.deleteProduct
);

// 상품 삭제 - 2차 API
router.post(
  '/products/:productName',
  isAdminMiddleware,
  adminController.confirmDeleteProduct
);

// 상품 수정
router.patch(
  '/products/:productName',
  isAdminMiddleware,
  adminController.updateProduct
);

// 상품 발주
router.post(
  '/products/order/:productName',
  isAdminMiddleware,
  adminController.addProductOrder
);

// 상품 발주 상태 수정
router.patch(
  '/products/order/:productOrderId',
  isAdminMiddleware,
  adminController.updateProductOrderState
);

module.exports = router;
