import mongoose from "mongoose";
import colors from "colors";

const dbconnection = async()=>{
    try {
        const url = process.env.MONGO_URL;
        let conn = await mongoose.connect(url);
        console.log(`DB is connected ${conn.connection.host} `.bgGreen.white);
        
    } catch (error) {
        console.log(error, "DB is not connected" .bgGreen.white);
    }
}

export default dbconnection;