const bannerModel = require('../../models/bannerModel');
const productModel = require('../../models/productModel');
const cloudinary  = require('../../utils/cloudinaryConfig');
const { responseReturn } = require('../../utils/response')
const { formidable } = require('formidable');


class bannerController {
    add_banner = async (req, res) => {
        const form = formidable()
        form.parse(req, async (err, fields, files) => {

            if (err) {
                responseReturn(res, 404, { error: 'something error' })
            } else {
                let { productId } = fields
                let { bannerImage } = files
                let filepath = bannerImage.map((item) => item.filepath);
                let path = filepath.toString()

                try {
                    const {slug} = await productModel.findById(productId)
                    const available = await bannerModel.find({productId:productId})                    
                    if(available.length !==0){
                        let temp = available[0].banner.split('/')
                        temp = temp[temp.length -1]
                        const imageName = temp.split('.')[0]
                        await cloudinary.uploader.destroy(imageName)
                        await available[0].deleteOne()
                        const result = await cloudinary.uploader.upload(path, { folder: 'banners' })
                        if (result) {
                            const banner = await bannerModel.create({
                                productId: productId,
                                link: slug,
                                banner: result.url
                            })
                            responseReturn(res, 201, { banner, message: 'Banner added successfully' })
                        } else {
                            responseReturn(res, 404, { error: 'Image upload failed' })
                        }
                    }else{
                        const result = await cloudinary.uploader.upload(path, { folder: 'banners' })
                        if (result) {
                            const banner = await bannerModel.create({
                                productId: productId,
                                link: slug,
                                banner: result.url
                            })
                            responseReturn(res, 201, { banner, message: 'Banner added successfully' })
                        } else {
                            responseReturn(res, 404, { error: 'Image upload failed' })
                        }
                    }
                } catch (error) {
                    responseReturn(res, 500, { error: 'Internal server error' })
                }

            }
        })
    }

    get_banner = async (req, res) => {
        const { productId } = req.params;
        try {
            const banner = await bannerModel.find({productId:productId})
            responseReturn(res, 200, { banner })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    get_banners = async (req, res) => {

        try {
            const banners = await bannerModel.aggregate([
                {
                    $sample:{
                        size:10
                    }
                }
            ])
            responseReturn(res, 200, { banners })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
}

module.exports = new bannerController()