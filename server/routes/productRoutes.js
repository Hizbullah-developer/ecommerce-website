import express from "express"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFilterController, productListController, productPhotoController, relatedProductController, serachProductController, updateProductController } from "../controllers/productController.js";
import formidable from "express-formidable";


const router = express.Router();

//routes
router.post("/create-product", requireSignIn, isAdmin, formidable(), createProductController);

//get product routes
router.get("/get-product", getProductController);

//get single product routes
router.get("/get-product/:slug", getSingleProductController);

//get product photo routes
router.get("/product-photo/:pid", productPhotoController);

//delete product routes
router.delete("/delete-product/:pid", deleteProductController);

//update product routes
router.put("/update-product/:pid", requireSignIn, isAdmin, formidable(), updateProductController);

//product filter routes
router.post("/product-filter", productFilterController);

//product count routes
router.get("/product-count", productCountController);

//product per page routes
router.get("/product-list/:page", productListController);

//search routes
router.get("/search/:keyword", serachProductController)

//related product routes
router.get("/related-product/:pid/:cid", relatedProductController)

//category wise product
router.get("/product-category/:slug", productCategoryController)

//payments routes
//token
router.get("/braintree/token", braintreeTokenController)

//payments
router.post("/braintree/payment", requireSignIn, braintreePaymentController)

export default router;