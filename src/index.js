const express = require('express')
const Room = require('./models/room')
const mongoose = require('mongoose')
const { findOne, findOneAndDelete } = require('./models/room')
const User = require('./models/user')
const Period = require('./models/period')

mongoose.connect('mongodb+srv://hotelappuser:test@cluster0.ixiwd.mongodb.net/hotelapp-api?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const app = express()

app.use(express.json())

// period apis======================================
//show periods
app.get('/period', async (req, res) => {
    const email = req.query.email
    const roomNo = req.query.roomNo

    const users = []
    try {
        if(email && roomNo) {
            users = await User.find({email: email, roomNo: roomNo})
        }else if(email) {
            users = await User.find({email: email})
        }else if(roomNo) {
            users = await User.find({roomNo: roomNo})
        }else{
            users = await User.find()
        }
        res.send(users)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

//user apis ============================================
//get all or particular user
app.get('/users', async (req, res) => {
    const email = req.query.email
    
    try {
        if(email){
            const user = await User.findOne({email: email})
            await user.populate({
                path: 'myBookings'
            }).execPopulate()
            if(!user) {
                return res.send('Please enter correct email')
            }
            res.send(user.myBookings)
        }else {
            const users = await User.find()
            res.send(users)
        }
    } catch (e) {
        res.status(500).send(e)
    }
})

//create a user
app.post('/users', async (req, res) => {
    const user = new User({...req.body})
    console.log(user)
    try {
        const saved = await user.save()
        res.send(saved)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//delete a user
app.delete('/users', async (req, res) => {
    if(!req.query.email) {
        return res.send('please provide email of user to delete')
    }
    const email = req.query.email
    try {
        const user = await User.findOneAndDelete({email: email})
        res.send(user)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

//show a particular users all bookings
app.get('/user/myBookings', async (req, res) => {
    const email = req.query.email

    try {
        const periods = Period.find({email: email})
    } catch (error) {
        
    }
})

//room apis=======================================
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


// show bookings of given Room No
app.get('/showRoomNo/:no', async (req, res) => {
    const roomNo = req.params.no
    
    try{
        const room = await Room.findOne({roomNo: parseInt(roomNo)})
        if(!room) {
            return res.send('Given room no doesnot exist')
        }

        await room.populate({
            path: 'bookedList'
        }).execPopulate()

        res.send(room.bookedList)
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

const checkAvailability = function (bookfor, periods) {
    try {
        if (!bookfor) {
            throw new Error('bookfor is undefined')
        }
        if (bookfor.startDate > bookfor.endDate) {
            throw new Error('start date cannot be greater than end date')
        }

        return periods.every((period) => {
            if (bookfor.endDate < period.startDate) return true;
            else if (bookfor.startDate > period.endDate) return true;
            else return false
        })
    } catch (e) {
        console.log('error in checkAvailability')
        throw new Error(e)
    }
}

//book room for given room no, email and a period
app.post('/bookRoom', async (req, res) => {
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
        res.send(period)
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
        console.log('Room count ', rooms.length)

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

        console.log( 'index ', index)

        const period = new Period({
            roomNo: rooms[index].roomNo,
            email: email,
            startDate: bookfor.startDate,
            endDate: bookfor.endDate
        })

        await period.save()
        res.send(period)
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