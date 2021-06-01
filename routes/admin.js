const path = require('path');
const express = require('express');
const {body} = require('express-validator/check');
const adminController = require('../controllers/admin');
const router = express.Router();

const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
// /admin/products => GET
router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth,  adminController.getProducts);
router.get('/add-product/:productId', isAuth,  adminController.getEditProduct);
// // /admin/add-product => POST
router.post('/add-product', [
        body('title')
            .isString()
            .isLength({min: 3})
            .trim(),
        body('imageUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({min: 8})
            .trim(),
    ], 
    isAuth,  
    adminController.postAddProduct);
router.post('/edit-product', [
        body('title')
            .isString()
            .isLength({min: 3})
            .trim(),
        body('imageUrl')
            .isURL(),
        body('price')
            .isFloat(),
        body('description')
            .isLength({min: 8})
            .trim(),
    ], 
    isAuth,  
    adminController.postEditProduct);
router.post('/delete-product', isAuth,  adminController.postDeleteProduct);

module.exports = router;
