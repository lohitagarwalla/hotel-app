const mongoose = require('mongoose')
const validator = require('email-validator')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.validate(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    phone: {
        type: Number,
        min: 99999999,
        max: 999999999
    },
    password: {
        type: String,
        minLength: 7
    },
    token: {
        type: String
    }
})

userSchema.virtual('myBookings', {
    ref: 'Period',
    localField: 'email',
    foreignField: 'email',
    // option: {sort: {startDate: -1}}
})

userSchema.methods.genWebToken = function () {
    const user = this
    const userObject = user.toObject()

    const email = userObject.email

    const token = jwt.sign({email: email}, 'mySecretKey')
    // console.log(token)
    return token
}

userSchema.methods.prepareToSend = function () {
    const user = this.toObject()

    delete user._id
    delete user.__v
    delete user.password

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User