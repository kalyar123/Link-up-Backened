const mongoose= require ('mongoose');
const needyfunddetailschema=new mongoose.Schema({
    name:String,
    email:String,
    mosque:String,
    date:String,
    amount:String,
    receipt:String,
    accountno:String,
    easypaisano:String
},
{
    collection:"memberneedyfundusers"
}
);
mongoose.model('memberneedyfundusers',needyfunddetailschema);