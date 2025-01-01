import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import User from "../models/user.model.js";
import orderModel from "../models/orderModel.js"
import JWT from "jsonwebtoken";

export const registerController = async (req, res)=>{
    try {
        const {name, email, password, phone, address, answer} = req.body;

        //validations
        if(!name){
            return res.status(400).send({message: "Name is required"});
        }
        if(!answer){
            return res.status(400).send({message: "Answer is required"});
        }
        if(!email){
            return res.status(400).send({message: "Email is required"});
        }
        if(!password){
            return res.status(400).send({message: "Password is required"});
        }
        if(!phone){
            return res.status(400).send({message: "Phone number is required"});
        }
        if(!address){
            return res.status(400).send({message: "Address is required"});
        }

        //check user
        const existingUser = await User.findOne({email});

        //existing user
        if(existingUser){
         return res.status(200).send({
                success: false,
                message: "User already existing please login"
            });
        }

        //register user
        const hashedPassword = await hashPassword(password);

        //save
        const user = await new User({name, email, phone, address , password: hashedPassword, answer}).save();
        res.status(201).send({
            success: true,
            message: "User created successfully",
            user
        })

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Error while creating user",
            error: error.message
        })
    }
}

//post login
export const loginController = async(req, res)=>{
    try {
        const {email, password} = req.body;

        //validation
        if(!email){
            return res.status(500).send({
                success: false,
                message: "Email are required"
            })
        }

        if(!password){
            return res.status(500).send({
                success: false,
                message: "Password are required"
            })
        }

        //check user
        const user = await User.findOne({email});
        if(!user){
           return res.status(400).send({
                success: false,
                message: "Email is not register",
            })
        }

        const match = await comparePassword (password, user.password);
        if(!match){
        return res.status(200).send({
            success: false,
            message: "Invalid password"
        })
        }

        //token
        const token = JWT.sign({_id: user._id} , process.env.JWT_SECRET, {expiresIn: "7d"});
        res.status(200).send({
            success: true,
            message: "Login successfully",
            user:{ 
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,
        })

    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Error in login",
            error: error.message
        })
        
    }
}


// forgot password controller

export const forgotPasswordController = async(req, res) => {
    try {
        const {email, answer, newPassword} = req.body;
        if(!email){
            res.status(400).send({message: "Email is required"});
        }

        if(!answer){
            res.status(400).send({message: "Answer is required"});
        }

        if(!newPassword){
            res.status(400).send({message: "New Password is required"})
        }

        // check
        const user = await User.findOne({email, answer});

        // validation
        if(!user){
            return res.status(404).send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }

        const hashed = await hashPassword(newPassword)
        await User.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully"
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }

}

// test controller

export const testController = (req, res)=> {
    res.send("protected routes");
    
}

//update profile controller
export const updateProfileController = async(req, res)=>{
    try {
        const {name, email, password, phone, address} = req.body;
        const user = await User.findById(req.user._id);
        //password
        if(password && password.length < 6) {
            return res.json({error : "Password is required and 6 character long"});
        }

        const hashedPassword = password ? await hashPassword(password) : undefined
        const updateUser = await User.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
        }, {new: true})
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updateUser,
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Something went wrong while update profile",
            error
        })
    }
}

//get orders controller
export const getOrdersController = async(req,res)=>{
    try {
        const orders = await orderModel.find({buyer: req.user._id}).populate("products","-photo").populate("buyer","name");
        res.json(orders);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Something went wrong while getting orders",
            error
        })
    }
}

//get all orders
export const getAllOrdersController = async(req, res)=>{
    try {
        const orders = await orderModel.find({}).populate("products","-photo").populate("buyer","name").sort({createdAt : -1});
        res.json(orders);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Something went wrong while getting all orders",
            error
        }) 
    }
}

//order status controller
export const orderStatusController = async(req, res)=>{
    try {
        const {orderId} = req.params;
        const {status} = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, {status}, {new:true});
        res.json(orders);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            success: false,
            message: "Something went wrong while update order status",
            error
        })  
    }
}
