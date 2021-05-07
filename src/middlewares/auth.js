const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        if(!req.header('Authorization')) {
            throw new Error('you are not authenticated')
        }
        const token = req.header('Authorization').replace('Bearer ', '')
        const fds = token + 'abc'
        const data = jwt.verify(token, 'mySecretKey')
        const user = await User.findOne({email: data.email})
        if(!user) {
            throw new Error('No such user is present')
        }
        req.user = user
    } catch (error) {
        // console.log(error)
        // const e = error
        res.status(500).send({message: 'Please authenticate'})
    }
    next ()
}

module.exports = auth