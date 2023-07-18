const mongoose= require ('mongoose');
const funddetailschema=new mongoose.Schema({
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
    collection:"fundmembers"
}
);
mongoose.model('fundmembers',funddetailschema);