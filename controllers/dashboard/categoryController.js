const categoryModel = require('../../models/categoryModel');
const cloudinary  = require('../../utils/cloudinaryConfig');
const { responseReturn } = require('../../utils/response')
const { formidable } = require('formidable');
const slugify = require("slugify");


class categoryController {
    add_category = async (req, res) => {
        const form = formidable()
        form.parse(req, async (err, fields, files) => {

            if (err) {
                responseReturn(res, 404, { error: 'something error' })
            } else {
                let { name } = fields
                let { image } = files
                let filepath = image.map((item) => item.filepath);
                let path = filepath.toString()
                let title = name.toString()
                const slug = slugify(name.toString(), { replacement: "-", lower: true })

                try {
                    const result = await cloudinary.uploader.upload(path, { folder: 'categorys' })
                    if (result) {
                        const category = await categoryModel.create({
                            name: title,
                            slug: slug,
                            image: result.url
                        })
                        responseReturn(res, 201, { category, message: 'Category added successfully' })
                    } else {
                        responseReturn(res, 404, { error: 'Image upload failed' })
                    }
                } catch (error) {
                    responseReturn(res, 500, { error: 'Internal server error' })
                }

            }
        })
    }

    get_category = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }
            if (searchValue && page && parPage) {
                const categorys = await categoryModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                //console.log(categorys)
                const totalCategory = await categoryModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                //console.log(totalCategory)
                responseReturn(res, 200, { totalCategory, categorys })
            }
            else if (searchValue === '' && page && parPage) {
                const categorys = await categoryModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalCategory = await categoryModel.find({}).countDocuments()
                responseReturn(res, 200, { totalCategory, categorys })
            }
            else {
                const categorys = await categoryModel.find({}).sort({ createdAt: -1 })
                const totalCategory = await categoryModel.find({}).countDocuments()
                responseReturn(res, 200, { totalCategory, categorys })
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}

module.exports = new categoryController()