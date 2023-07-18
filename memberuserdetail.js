const mongoose= require ('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

// Generate a JWT

;


const memberdetailschema=new mongoose.Schema({
    // name:String,
    // email:{type:String,unique:true},
    // mosque:String,
    // password:String,
    // confirmpassword:String
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mosque:{
        type:String,
        required:true
    },
    accountno:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    phoneno:{
        type:String,
        required:true
    },
    tokens: [
        {
            token:{
                type: String,
                require: true

            }
        }
    ]

},{timestamps:true});
memberdetailschema.pre('save', async function (next) {
    console.log('hi from inside')
    if (this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12)
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 12)

    }
    next();
})
memberdetailschema.methods.generateAuthToken = async function () {
    try {
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign({ _id: this._id }, secretKey);
        const newToken = { token: token };
        this.tokens = this.tokens.concat(newToken);
        await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
};
mongoose.model('memberuser',memberdetailschema);