import mongoose from "mongoose";

const schema = new mongoose.Schema({

    title:{
        type:String,
        required:[true,"Please enter course title"],
        minLength:[4,"Title must be atleast 4 characters long."],
        maxLength:[60,"Title should not exceed 60 characters."],
    },
    description:{
        type:String,
        required:[true,"Please enter course description"],
        minLength:[15,"Description must be atleast 15 characters long."],
        
    },
    lectures:[
        {
            title:{
                type:String,
                required:true,
            },
            description:{
                type:String,
                required:true,
            },
            video:{
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                }     
            },
        }
    ],
    poster:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }

    },
    views:{
        type:Number,
        default:0
    },
    numOfVideos:{
        type:Number,
        default:0,
    },
    category:{
        type:String,
        required:true,
    },
    createdBy:{
        type:String,
        required:[true,"Enter Creator Name"],
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});

export const Course = mongoose.model("Course",schema);  