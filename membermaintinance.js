const mongoose= require ('mongoose');
const maintinanceschema=new mongoose.Schema({
    name:String,
    date:String,
    amount:String,
    phoneno:String,
    reason:String,
    email:String,
     
    // name:{
    //     type:String,
    //     required:true
    // },
    // phoneno:{
    //     type:String,
    //     required:true
    // },
    // date:{
    //     type:String,
    //     required:true
    // },
    // amount:{
    //     type:String,
    //     required:true
    // },
    // reason:{
    //     type:String,
    //     required:true
    // }
},
{
    collection:"membermaintinancemosque"
}
);
mongoose.model('membermaintinancemosque',maintinanceschema);