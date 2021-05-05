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

periodSchema.methods.prepareToSend = function () {
    // console.log('from prepare to send')
    const period = this
    const periodObject = period.toObject()
    periodObject.From = period.startDate.toDateString()
    periodObject.To = period.endDate.toDateString()

    delete periodObject.startDate
    delete periodObject.endDate
    delete periodObject.__v
    delete periodObject._id

    return periodObject
}


const Period = mongoose.model('Period', periodSchema)

module.exports = Period