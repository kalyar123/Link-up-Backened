const mongoose= require ('mongoose');
const bloodrequestschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mosque:{
        type:String,
        required:true
    },
    // disease:{
    //     type:String,
    //     required:true
    // },
    unit:{
        type:String,
        required:true
    },
    phoneno:{
        type:String,
        required:true
    },
    age:{
        type:String,
        required:true
    },
    blood:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
},
{
    collection:"requestblood"
}
);
mongoose.model('requestblood',bloodrequestschema);