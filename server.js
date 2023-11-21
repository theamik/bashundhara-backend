const express = require('express')
const {
    dbConnect
} = require('./utils/db')
const app = express()
const cors = require('cors')
const http = require('http')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const socket = require('socket.io')

const server = http.createServer(app)

// app.use(cors({
//     origin: ['https://bashundhara-admin.onrender.com', 'https://bashundhara.vercel.app'],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"]
// }))

app.use(cors({
    origin: process.env.pro? ['https://bashundhara-admin.onrender.com', 'https://bashundhara.vercel.app'] :['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:3001'],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"]
// }))
const io = socket(server, {
    cors: {
        origin: ['https://bashundhara-admin.onrender.com', 'https://bashundhara.vercel.app'],
        credentials: true
    }
})

var allCustomer = []
var allSeller = []

const addUser = (customerId, socketId, userInfo) => {
    const checkUser = allCustomer.some(u => u.customerId === customerId)
    if (!checkUser) {
        allCustomer.push({
            customerId,
            socketId,
            userInfo
        })
    }
}


const addSeller = (sellerId, socketId, userInfo) => {
    const chaeckSeller = allSeller.some(u => u.sellerId === sellerId)
    if (!chaeckSeller) {
        allSeller.push({
            sellerId,
            socketId,
            userInfo
        })
    }
}


const findCustomer = (customerId) => {
    return allCustomer.find(c => c.customerId === customerId)
}
const findSeller = (sellerId) => {
    return allSeller.find(c => c.sellerId === sellerId)
}

const remove = (socketId) => {
    allCustomer = allCustomer.filter(c => c.socketId !== socketId)
    allSeller = allSeller.filter(c => c.socketId !== socketId)
}

let admin = {}

const removeAdmin = (socketId) => {
    if (admin.socketId === socketId) {
        admin = {}
    }
}


io.on('connection', (soc) => {
    console.log('socket server is connected...')

    soc.on('add_user', (customerId, userInfo) => {
        addUser(customerId, soc.id, userInfo)
        io.emit('activeSeller', allSeller)
        io.emit('activeCustomer', allCustomer)
    })
    soc.on('add_seller', (sellerId, userInfo) => {
        addSeller(sellerId, soc.id, userInfo)
        io.emit('activeSeller', allSeller)
        io.emit('activeCustomer', allCustomer)
        io.emit('activeAdmin', { status: true })

    })

    soc.on('add_admin', (adminInfo) => {
        delete adminInfo.email
        admin = adminInfo
        admin.socketId = soc.id
        io.emit('activeSeller', allSeller)
        io.emit('activeAdmin', { status: true })

    })
    soc.on('send_seller_message', (msg) => {
        const customer = findCustomer(msg.receverId)
        if (customer !== undefined) {
            soc.to(customer.socketId).emit('seller_message', msg)
        }
    })

    soc.on('send_customer_message', (msg) => {
        const seller = findSeller(msg.receverId)
        if (seller !== undefined) {
            soc.to(seller.socketId).emit('customer_message', msg)
        }
    })

    soc.on('send_message_admin_to_seller', msg => {
        const seller = findSeller(msg.receverId)
        if (seller !== undefined) {
            soc.to(seller.socketId).emit('receved_admin_message', msg)
        }
    })


    soc.on('send_message_seller_to_admin', msg => {

        if (admin.socketId) {
            soc.to(admin.socketId).emit('receved_seller_message', msg)
        }
    })


    soc.on('disconnect', () => {
        console.log('user disconnect')
        remove(soc.id)
        removeAdmin(soc.id)
        io.emit('activeAdmin', { status: false })
        io.emit('activeSeller', allSeller)
        io.emit('activeCustomer', allCustomer)

    })
})

app.use(bodyParser.json())
app.use(cookieParser())

app.use('/api/v1/home', require('./routes/home/homeRoutes'))
app.use('/api/v1', require('./routes/authRoutes'))
app.use('/api/v1', require('./routes/dashboard/categoryRoutes'))
app.use('/api/v1', require('./routes/dashboard/bannerRoutes'))
app.use('/api/v1', require('./routes/dashboard/productRoutes'))
app.use('/api/v1', require('./routes/dashboard/sellerRoutes'))
app.use('/api/v1', require('./routes/dashboard/dashboardIndexRoutes'))
app.use('/api/v1', require('./routes/home/customerAuthRoutes'))
app.use('/api/v1', require('./routes/home/cardRoutes'))
app.use('/api/v1', require('./routes/order/orderRoutes'))
app.use('/api/v1', require('./routes/chatRoutes'))
app.use('/api/v1', require('./routes/paymentRoutes'))

app.get('/', (req, res) => res.send('Hello World!'))

const port = process.env.PORT
dbConnect();
server.listen(port, () => console.log(`Server is running  on port ${port}!`))