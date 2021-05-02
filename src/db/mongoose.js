const mongoose = require('mongoose')
const validator = require('validator')


mongoose.connect('mongodb+srv://hotelappuser:test@cluster0.ixiwd.mongodb.net/hotelapp-api?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

