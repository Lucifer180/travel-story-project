const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    fullName:{
        type:String,required:true
    },
    email:{
        type:String,required:true,unique:true,lowercase:true,trim:true
    },
    password:{
        type:String,required:true
    },
    createdOn:{
        type:Date,default:Date.now
    },
    // Forgot-password: only a SHA-256 hash of the emailed token is stored
    resetPasswordTokenHash:{type:String,default:null,index:true},
    resetPasswordExpires:{type:Date,default:null},
    resetPasswordRequestedAt:{type:Date,default:null}
});
module.exports=mongoose.model("User",userSchema);