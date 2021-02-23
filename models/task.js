const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    image: {
        type: String,
    },
    prodName: {
        type: String,
        required:true,
        trim: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error('price must be positve number')
            }
        }
    },
    details: {
        type: String,
        trim: true,
        maxlength: 80,
        lowercase:true
    },
    stock: {
        type: Boolean,
        required:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    }
    
     
})


const Task = mongoose.model('Task', taskSchema)
module.exports= Task