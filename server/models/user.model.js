import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // for remove white space from name
    },

    email: {
        type: String,
        required: true,
        unique: true // every person has unique email
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: {},
        required: true
    },

    answer: {
        type: String,
        required: true
    },

    role: {
        type: Number,
        default: 0 // 0 means false and 1 meanns true
    },
},

{ timestamps: true } // jub bhi new user login hoga uska login time save hoga

)

const User = mongoose.model("User", userSchema);

export default User;