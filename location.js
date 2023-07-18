const mongoose= require ('mongoose');
const locationschema=new mongoose.Schema({
    mosquename:{
        type:String,
        required:true
    },
    longitude:{
        type:String,
        required:true
    },
  
    latitude:{
        type:String,
        required:true
    }
},
{
    collection:"location"
}
);
mongoose.model('location',locationschema);