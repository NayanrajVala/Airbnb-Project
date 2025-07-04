const mongoose =require("mongoose");
const Listing=require("../models/listing.js")
const initdata=require("./data.js")
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');}

const init=async()=>{
 await Listing.deleteMany({});
 initdata.data=initdata.data.map((el)=>({...el,owner:'66cf20a28fe103ed2742c860'}))
 await Listing.insertMany(initdata.data);

}
init();