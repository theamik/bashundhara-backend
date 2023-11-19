const { Schema, model } = require('mongoose')

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    slug: {
        type: String,
        required: true
    }
}, { timestamps: true })

categorySchema.index({
    name: 'text'
})

module.exports = model('categorys', categorySchema)