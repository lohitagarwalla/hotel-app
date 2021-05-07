const express = require('express')
const bcrypy = require('bcrypt')
const User = require('../models/user')
const auth = require('../middlewares/auth')

const router = express.Router()

//get all or particular user
router.get('/user', auth, async (req, res) => {
    const email = req.query.email
    
    try {
        if(email){
            res.send(req.user)
        }else {
            const users = await User.find()
            res.send(users)
        }
    } catch (e) {
        res.status(500).send(e)
    }
})

//show a particular users all bookings
router.get('/user/myBookings', auth, async (req, res) => {
//     const email = req.query.email

//     if(!email) {
//         return res.send('Please provide email. eg http://localhost:3000/users/myBookings?email=something@fds.com')
//     }

    try {
        // const user = await User.findOne({email: email})
        // if(!user) {
        //     return res.send('No user with given email. Please provide correct email address')
        // }
        const user = req.user
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


// logout a user
router.get('/user/logout', auth, async (req, res) => {
    try{
        const token = ''
        res.send(token)
    }
    catch(error) {
        res.status(500).send('Could not logout')
    }
})

//user login
router.post('/user/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const user = await User.findOne({email: email})
        if(!user) {
            return res.send('Unable to login')
        }

        const isMatch = await bcrypy.compare(password, user.password)
        if(isMatch === false){
            return res.send('Unable to login')
        }

        user.token = user.genWebToken();
        await user.save()
        res.send({user: user.prepareToSend(), token: user.token})
        
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})


//create a user
router.post('/user', async (req, res) => {
    const user = new User({...req.body})
    // console.log(user)
    try {
        const password = await bcrypy.hash(user.password, 8)
        user.password = password
        user.token = user.genWebToken()
        const saved = await user.save()
        res.send(saved.prepareToSend())
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})



//delete a user
router.delete('/user', auth, async (req, res) => {
    // if(!req.query.email) {
    //     return res.send('please provide email of user to delete')
    // }
    // const email = req.query.email
    try {
        const user = req.user
        await user.remove()
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