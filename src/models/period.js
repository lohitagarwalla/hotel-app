const mongoose = require('mongoose')

const periodSchema = mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    roomNo: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
})


const Period = mongoose.model('Period', periodSchema)

module.exports = Period