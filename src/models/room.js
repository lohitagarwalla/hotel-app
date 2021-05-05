const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    roomNo: {
        type: Number,
        required: true,
        unique: true
    },
    aircondition: {
        type: Boolean,
        required: true
    },
    attachwashroom: {
        type: Boolean,
        required: true
    },
    bedCount: {
        type: Number
    }
})

roomSchema.virtual('bookedList', {
    ref: 'Period',
    localField: 'roomNo',
    foreignField: 'roomNo'
})

roomSchema.methods.prepareToSend = function () {
    const room = this
    const roomObject = room.toObject()

    delete roomObject._id
    delete roomObject.__v

    return roomObject
}

const Room = mongoose.model('Room', roomSchema)

module.exports = Room