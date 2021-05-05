const express = require('express')
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const periodRoutes = require('./routes/periodRoutes')
const roomRoutes = require('./routes/roomRoutes')

mongoose.connect('mongodb+srv://hotelappuser:test@cluster0.ixiwd.mongodb.net/hotelapp-api?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const app = express()

app.use(express.json())

const port = process.env.PORT || 3000

app.use(userRoutes)
app.use(periodRoutes)
app.use(roomRoutes)


app.listen(port, () => {
    console.log(`server is up on port ${port}`)
})