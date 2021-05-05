const express = require('express')
const User = require('../models/user')

const router = express.Router()

//get all or particular user
router.get('/user', async (req, res) => {
    const email = req.query.email
    
    try {
        if(email){
            const user = await User.findOne({email: email})
            res.send(user)
        }else {
            const users = await User.find()
            res.send(users)
        }
    } catch (e) {
        res.status(500).send(e)
    }
})

//show a particular users all bookings
router.get('/user/myBookings', async (req, res) => {
    const email = req.query.email

    if(!email) {
        return res.send('Please provide email. eg http://localhost:3000/users/myBookings?email=something@fds.com')
    }

    try {
        const user = await User.findOne({email: email})
        if(!user) {
            return res.send('No user with given email. Please provide correct email address')
        }
        await user.populate({
            path: 'myBookings'
        }).execPopulate()

        const bookings = user.myBookings.map(period => period.prepareToSend())

        res.send(bookings)
    } catch (error) {
        console.log(error)
        res.status(500).send(e)
    }
})



//create a user
router.post('/user', async (req, res) => {
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
router.delete('/user', async (req, res) => {
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

//delete all users 
router.delete('/user/deleteAll', async (req, res) => {
    try {
        const users = await User.deleteMany({})
        res.send(`All (${users.deletedCount}) users are deleted`)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

module.exports = router