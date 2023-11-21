const mongoose = require('mongoose')

module.exports.dbConnect = async () => {
    try {
        if(process.env.mode==="pro"){
            await mongoose.connect(process.env.DB_PRO_URL, {
                useNewURLParser: true
            })
            console.log(`database connected with ${process.env.DB_PRO_URL}`)
        }else{
            await mongoose.connect(process.env.DB_LOC_URL, {
                useNewURLParser: true
            })
            console.log(`database connected with ${process.env.DB_LOC_URL}`)
        }
    } catch (error) {
        console.log(error.message)
    }
}