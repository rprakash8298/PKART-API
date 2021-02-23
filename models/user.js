const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim: true,
    },
    email: {
        type:String,
        required: true,
        trim: true,
        unique: true,
        lowercase:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('email is invalid')
            }
        }
    },
    age: {
        type: Number,
        trim: true,
        validate(value1) {
            if (value1 <= 0) {
                throw new Error('age must be postive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required:true
        }
    }]
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField:'owner'
})

userSchema.methods.genAuthToken = async function () {
    const user = this
    const token =await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens

    return userObj
}

userSchema.statics.findByCred = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) { throw new Error('invalid email') }
    
    if (password !== user.password) { throw new Error('pass does not match') }
    return user
}

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User