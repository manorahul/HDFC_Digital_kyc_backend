import mongoose from "mongoose";
mongoose.set('strictQuery', false)

const Connection = async (URL) => {
  try {
    await mongoose.connect(URL);
    console.log(`Connection is successfull....................`);
  } catch (e) {
    console.log("Error while connecting..... ", e)
  }
}
 
export default Connection;
