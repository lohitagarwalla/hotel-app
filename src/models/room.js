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
    },
    bookedDates: [
        {
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date,
                required: true
            }
        }
    ]
})

roomSchema.methods.prepareToSend = function () {
    console.log('from room schema preparetosend')
    const room = this
    const roomObject = room.toObject()
    delete roomObject._id
    const object = []
    roomObject.bookedDates.forEach((date) => {
        const x = {
            From: date.startDate.toDateString(),
            To: date.endDate.toDateString()
        }
        object.push(x)
    })
    roomObject.bookedFor = object
    delete roomObject.bookedDates
    delete roomObject.__v

    console.log(roomObject)

    return roomObject
}

const Room = mongoose.model('Room', roomSchema)

module.exports = Room