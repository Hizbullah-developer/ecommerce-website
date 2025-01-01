import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";



//create category
export const createCategoryController = async(req, res) =>{
    try {
        const {name} = req.body;
        if(!name){
            return res.status(401).send({message: "Name is required"});

        }

        const existingCategory = await categoryModel.findOne({name});
        if(existingCategory){
            return res.status(200).send({
                success: true,
                message: "Category already exisits"
            })
        }

        const category = await new categoryModel({name, slug:slugify(name)}).save();
        res.status(201).send({
            success: true,
            message: "New Category Created",
            category
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "error in category",
            error: error.message
        })

        
    }
};

//update controller
export const updateCategoryContoller = async(req, res)=> {
    try {
        const {name} = req.body;
        const {id} = req.params;

        const category = await categoryModel.findByIdAndUpdate(id,{name, slug:slugify(name)}, {new:true});
        res.status(200).send({
            success: true,
            message: "Category update successfully",
            category,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while updating category",
            error: error.message,
        })
        
    }
}

// all category
export const categoryController = async(req, res)=>{
    try {
        const category = await categoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All Categories list",
            category,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "error while getting all category",
            error: error.message,
        })
    }

}

//single category
export const singleCategoryController = async(req, res)=>{
    try {
        const category = await categoryModel.findOne({slug: req.params.slug})
        res.status(200).send({
            success: true,
            message:"Get single category successfully",
            category,
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error while getting category",
            error: error.message,
        })
    }
}

//delete category controller
export const deleteCategoryController = async(req, res)=> {
    try {
        const {id} = req.params;
        await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "category delete successfully",
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message:"error while deleting category",
            error: error.message,
        })
        
    }
}