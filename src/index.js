const express = require('express')
const Room = require('./models/room')
const mongoose = require('mongoose')
const { findOne } = require('./models/room')

mongoose.connect('mongodb+srv://hotelappuser:test@cluster0.ixiwd.mongodb.net/hotelapp-api?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    console.log(req.query.name)
    // console.log(req.params.string)
    res.send('from hotel app')
})


// get list of rooms with required no of beds
app.get('/noOfBeds/:nu', async (req, res) => {
    const nu = req.params.nu
    try {
        const rooms = await Room.find({ bedCount: nu })
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

app.get('/showRoomNo/:no', async (req, res) => {
    const roomNo = req.params.no
    
    try{
        const room = await Room.findOne({roomNo: parseInt(roomNo)})
        if(!room) {
            return res.send('Given room no doesnot exist')
        }
        console.log(room.prepareToSend())
        res.send(room.prepareToSend())
    }catch (e) {
        console.log('Showroomno failed')
        res.status(500).send(e)
    }
})

//show all rooms 
app.get('/showAllRooms', async (req, res) => {
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


//Create a new room
app.post('/createRoom', async (req, res) => {
    console.log(req.body)
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

const checkAvailability = function (bookfor, room) {
    try {
        if (!room) {
            throw new Error('Room is undefined')
        }
        if (!bookfor) {
            throw new Error('bookfor is undefined')
        }
        if (bookfor.startDate > bookfor.endDate) {
            throw new Error('start date cannot be greater than end date')
        }

        return room.bookedDates.every((bookeddate) => {
            if (bookfor.endDate < bookeddate.startDate) return true;
            else if (bookfor.startDate > bookeddate.endDate) return true;
            else return false
        })
    } catch (e) {
        console.log('error in checkAvailability')
        throw new Error(e)
    }
}

//book room for given room no and a period
app.patch('/bookRoom', async (req, res) => {
    const roomNo = req.body.roomNo
    const startDate = req.body.startDate
    const endDate = req.body.endDate

    bookfor = {
        startDate: new Date(startDate.year, startDate.month, startDate.date),
        endDate: new Date(endDate.year, endDate.month, endDate.date)
    }

    try {
        const room = await Room.findOne({ roomNo: roomNo })
        if (!room) {
            res.send('Given room no doesnot exist')
        }

        const isAvailable = checkAvailability(bookfor, room)
        if(isAvailable == false) {
            return res.send('Room is not available for given period')
        }

        room.bookedDates.push(bookfor)
        const updatedRoom = await room.save()

        res.send(updatedRoom.prepareToSend())
    } catch (e) {
        console.log('failed to book a room', e)
        res.status(500).send(e)
    }
})



//book room with given no of beds and period
app.patch('/bookWithbeds', async (req, res) => {
    const beds = req.body.beds
    const startDate = req.body.startDate
    const endDate = req.body.endDate

    bookfor = {
        startDate: new Date(startDate.year, startDate.month, startDate.date),
        endDate: new Date(endDate.year, endDate.month, endDate.date)
    }

    if (bookfor.startDate > bookfor.endDate) {
        res.send('start date cannot greater than end date')
    }

    try {
        const rooms = await Room.find({ bedCount: beds })

        if (rooms.length === 0) {
            res.send('Sorry, room with required no of beds does not exist')
        }

        const index = rooms.findIndex((room) => checkAvailability(bookfor, room))

        if (index == -1) {
            return res.send('no rooms available for given period')
        }

        rooms[index].bookedDates.push(bookfor)
        const updatedRoom = await rooms[index].save()

        res.send(updatedRoom.prepareToSend())
    } catch (e) {
        console.log('failed to book a room', e)
        res.status(500).send()
    }
})


//delete room of given room no
app.delete('/:roomno', async (req, res) => {
    const roomNo = req.params.roomno
    try {
        const room = await Room.findOneAndDelete({ roomNo: parseInt(roomNo) })
        res.send(room.prepareToSend())
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete all rooms.
app.delete('/deleteAll', async (req, res) => {
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



app.listen(3000, () => {
    console.log('server is up on port 3000')
})