import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js"
import fs from "fs";
import braintree from "braintree"
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv"

dotenv.config();
//payment gateway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });

export const createProductController = async(req, res)=> {
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields;
        const {photo} = req.files;

    //validation
    switch(true){
        case !name:
            return res.status(500).send({error: "Name is required"});
        case !description:
            return res.status(500).send({error: "description is required"});
        case !price:
            return res.status(500).send({error: "price is required"});
        case !category:
            return res.status(500).send({error: "category is required"});
        case !quantity:
            return res.status(500).send({error: "quantity is required"});
        case !photo && photo.size >1000000:
            return res.status(500).send({error: "photo is required and should be 1MB"});
    }

        const product = new productModel({...req.fields, slug:slugify(name)});
        if(photo){
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();
        res.status(201).send({
            success: true,
            message: "product created successfully",
            product,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message:"Error while creating product",
            error: error.message,
        })
    }
}

//get all product
export const getProductController = async(req, res)=> {
    try {
        const product = await productModel.find({}).populate("category").select("-photo").limit(12).sort({createdAt:-1});
        res.status(200).send({
            success: true,
            totalcount : product.length,
            message:"All Products",
            product,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while getting products",
            error: error.message,
        })
    }

}

//get single product 
export const getSingleProductController = async(req, res) => {
    try {
        const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate("category");
        res.status(200).send({
            success: true,
            message: "Single product fetch sucessfully",
            product,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while creating single product",
            error: error.message,
        })
    }
}

//get product photo
export const productPhotoController = async(req, res)=>{
    try {
        const product = await productModel.findById(req.params.pid).select("photo");
        if(product.photo.data){
            res.set("Content-type", product.photo.contentType);
            res.status(200).send(product.photo.data);
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while getting product photo",
            error: error.message,
        })
        
    }
}

//delete product
export const deleteProductController = async(req, res)=>{
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo");
        res.status(200).send({
            success: false,
            message: "delete product successfully",
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while deleting product",
            error: error.message,
        })
    }
}

//update product 

export const updateProductController = async (req, res) => {
    try {
      const { name, slug, description, price, category, quantity, shipping } = req.fields;
      const { photo } = req.files;
  
      // Fetch the existing product
      const existingProduct = await productModel.findById(req.params.pid);
      if (!existingProduct) {
        return res.status(404).send({ success: false, message: "Product not found" });
      }
  
      // Update fields conditionally
      if (name) existingProduct.name = name;
      if (name) existingProduct.slug = slugify(name); // Update slug if name changes
      if (description) existingProduct.description = description;
      if (price) existingProduct.price = price;
      if (category) existingProduct.category = category;
      if (quantity) existingProduct.quantity = quantity;
      if (shipping !== undefined) existingProduct.shipping = shipping; // Can be `false`
  
      // Handle photo update
      if (photo) {
        if (photo.size > 1000000) {
          return res.status(400).send({ error: "Photo size should not exceed 1MB" });
        }
        existingProduct.photo.data = fs.readFileSync(photo.path);
        existingProduct.photo.contentType = photo.type;
      }
  
      // Save updated product
      const updatedProduct = await existingProduct.save();
  
      res.status(200).send({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({
        success: false,
        message: "Error while updating product",
        error: error.message,
      });
    }
  };

  //product filter controller

export const productFilterController = async(req, res) => {
    try {
        const {checked, radio} = req.body;
        let args = {}
        if(checked.length > 0) args.category = checked;
        if(radio.length) args.price = {$gte: radio[0], $lte: radio[1]};
        const product = await productModel.find(args);
        res.status(200).send({
            success: true,
            product,
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error while filter product",
          error: error.message,
        });
    }
}

//product Count Controller
export const productCountController = async(req, res)=>{
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total,
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error while product count",
          error: error.message,
        });
    }
}


//product list base on Controller
export const productListController = async(req, res)=>{
    try {
        const perPage = 4;
        const page = req.params.page ? req.params.page : 1;
        const product = await productModel.find({}).select("-photo").skip((page-1) * perPage).limit(perPage).sort({createdAt:-1});
        res.status(200).send({
            success: true,
            product,
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error in per page ctrl",
          error: error.message,
        });
    }
}

//search product controller
export const serachProductController = async(req, res) => {
    try {
        const {keyword} = req.params
        const results = await productModel.find({
            $or: [
                {name: {$regex: keyword, $options:"i"}},
                {description: {$regex: keyword, $options:"i"}},
            ]
        }).select("-photo");
        res.json(results);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error in serch products",
          error: error.message,
        });
    }
}

//related product controller
export const relatedProductController = async(req, res)=>{
    try {
        const {pid, cid} = req.params;
        const product = await productModel.find({
            category: cid,
            _id: {$ne: pid},
        }).select("-photo").limit(3).populate("category");
        res.status(200).send({
            success: true,
            product,
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error in related products",
          error: error.message,
        });
    }
}

//get product by category
export const productCategoryController = async(req, res) =>{
    try {
        const category = await categoryModel.findOne({slug:req.params.slug});
        const product = await productModel.find({category}).populate("category");
        res.status(200).send({
            success: true,
            category,
            product,
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
          success: false,
          message: "Error in getting products",
          error: error.message,
        });
    }
}

//payment gateway controller
//token
export const braintreeTokenController = async(req, res)=>{
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if(err){
                res.status(500).send(err)
            } else {
                res.send(response)
            }
        });
    } catch (error) {
        console.log(error);
        
    }
}

export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;

        // Use forEach instead of map as we're not returning anything
        cart.forEach((i) => {
            total += i.price;
        });

        // Perform the transaction sale
        gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, async (error, result) => {
            if (result) {
                try {
                    // Wait for order creation to finish
                    await new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id,
                    }).save();
                    
                    res.json({ ok: true });
                } catch (orderError) {
                    console.log(orderError);
                    res.status(500).send({ error: 'Failed to create order' });
                }
            } else {
                // Handle the case where payment fails
                console.log(error); // Log the error for debugging
                res.status(500).send({
                    error: 'Payment failed',
                    details: error || 'Unknown error'
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Something went wrong with the payment' });
    }
};
