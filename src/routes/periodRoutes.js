const express = require('express')
const Room = require('../models/room')
const User = require('../models/user')
const Period = require('../models/period')
const checkAvailability = require('../utility/checkAvailability')

const router = express.Router()


//show all periods
router.get('/period/showAll', async (req, res) => {
    try {
        const periods = await Period.find({})
        const updatedPeriod = periods.map(period => period.prepareToSend())
        res.send(updatedPeriod)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})


//book room for given room no, email and a period
router.post('/period/bookWithRoomNo', async (req, res) => {
    const roomNo = req.body.roomNo
    const startDate = req.body.startDate
    const endDate = req.body.endDate
    const email = req.body.email

    bookfor = {
        startDate: new Date(startDate.year, startDate.month, startDate.date),
        endDate: new Date(endDate.year, endDate.month, endDate.date)
    }

    try {
        const room = await Room.findOne({ roomNo: roomNo })
        if (!room) {
            res.send('Given room no doesnot exist')
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            res.send('Given user doesnot exist')
        }

        const periods = await Period.find({roomNo: roomNo})

        const isAvailable = checkAvailability(bookfor, periods)
        if(isAvailable == false) {
            return res.send('Room is not available for given period')
        }

        const period = new Period({
            roomNo: roomNo,
            email: email,
            startDate: bookfor.startDate,
            endDate: bookfor.endDate
        })

        await period.save()
        res.send(period.prepareToSend())
    } catch (e) {
        console.log('failed to book a room', e)
        res.status(500).send(e)
    }
})



//book room with given no of beds and period
router.post('/period/bookWithbeds', async (req, res) => {
    const beds = req.body.beds
    const startDate = req.body.startDate
    const endDate = req.body.endDate
    const email = req.body.email

    bookfor = {
        startDate: new Date(startDate.year, startDate.month, startDate.date),
        endDate: new Date(endDate.year, endDate.month, endDate.date)
    }

    if (bookfor.startDate > bookfor.endDate) {
        return res.send('start date cannot greater than end date')
    }

    try {
        const rooms = await Room.find({ bedCount: beds })

        if (rooms.length === 0) {
            res.send('Sorry, room with required no of beds does not exist')
        }
        // console.log('Room count ', rooms.length)

        let index = -1
        let i;
        for(i=0; i< rooms.length; i++){
            const periods = await Period.find({roomNo: rooms[i].roomNo})
            if(checkAvailability(bookfor, periods) == true) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            return res.send('no rooms available for given period')
        }

        // console.log( 'index ', index)

        const period = new Period({
            roomNo: rooms[index].roomNo,
            email: email,
            startDate: bookfor.startDate,
            endDate: bookfor.endDate
        })

        await period.save()
        res.send(period.prepareToSend())
    } catch (e) {
        console.log('failed to book a room', e)
        res.status(500).send()
    }
})

//delete all periods
router.delete('/period/deleteAll', async (req, res) => {
    try {
        await Period.deleteMany({})
        res.send('All bookings deleted')
    } catch (error) {
        res.status(500).send(error)
    }
})




module.exports = router