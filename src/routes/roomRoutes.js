const express = require('express')
const User = require('../models/user')
const Room = require('../models/room')
const Period = require('../models/period')
const auth = require('../middlewares/auth')

const router = express.Router()

// get list of rooms with required no of beds
router.get('/room/noOfBeds', async (req, res) => {
    const nu = req.query.bedCount
    try {
        const rooms = await Room.find({ bedCount: parseInt(nu) })
        const roomsToSend = []
        for(let i = 0; i<rooms.length; i++){
            const x = rooms[i].prepareToSend()
            roomsToSend.push(x)
        }
        res.send(roomsToSend)
    } catch (error) {
        console.log('failed to get noOfBeds')
        res.status(500).send(error)
    }
})

// show bookings of given Room No
router.get('/room/showRoomBookings', async (req, res) => {
    const roomNo = req.query.roomNo
    
    try{
        const room = await Room.findOne({roomNo: parseInt(roomNo)})
        if(!room) {
            return res.send('Given room no doesnot exist')
        }
        await room.populate({
            path: 'bookedList'
        }).execPopulate()

        const bookings = room.bookedList.map(period => period.prepareToSend())
        res.send(bookings)
    }catch (e) {
        console.log('showRoomBookings failed')
        res.status(500).send(e)
    }
})

//show all rooms 
router.get('/room/showAllRooms', async (req, res) => {
    try {
        const rooms = await Room.find({})
        const roomsToSend = []
        for(let i = 0; i<rooms.length; i++){
            const x = rooms[i].prepareToSend()
            roomsToSend.push(x)
        }
        res.send(roomsToSend)
    } catch (error) {
        res.status(500).send(error)
    }
})

//show a particular room
router.get('/room/showRoom', async (req, res) => {
    const roomNo = req.query.roomNo
    try{
        const room = await Room.findOne({roomNo: parseInt(roomNo)})
        res.send(room.prepareToSend())
    }catch(e) {
        res.status(500).send(e)
    }
})

//Create a new room
router.post('/room/create', async (req, res) => {
    const room = new Room({
        ...req.body
    })

    try {
        const findroom = await Room.find({ roomNo: room.roomNo })
        if (findroom.length > 0) {
            return res.send('room with given room no already exist')
        }
        await room.save()
        res.send(room.prepareToSend())
    } catch (e) {
        console.log('errormessage', e)
        res.status(500).send('Cannot create a new room')
    }
    res.send(room)
})


//delete room of given room no
router.delete('/room/delete', async (req, res) => {
    const roomNo = req.query.roomNo
    try {
        const room = await Room.findOneAndDelete({ roomNo: parseInt(roomNo) })
        if(!room) {
            return res.send('room doesnot exist')
        }
        res.send(`room number ${roomNo} is deleted`)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete all rooms.
router.delete('/room/deleteAll', async (req, res) => {
    try {
        await Room.deleteMany({})
        res.send('All rooms deleted')
    } catch (error) {
        res.status(500).send(error)
    }
})


// get available rooms

// book a room with given room no and dates

// get list of rooms which are available for given date period


module.exports = router