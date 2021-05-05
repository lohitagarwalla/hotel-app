const mongoose = require('mongoose')
const validator = require('email-validator')

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

const User = mongoose.model('User', userSchema)

module.exports = User