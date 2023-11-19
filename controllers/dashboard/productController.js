
const productModel = require('../../models/productModel');
const cloudinary  = require('../../utils/cloudinaryConfig');
const { responseReturn } = require('../../utils/response')
const { formidable } = require('formidable');
const slugify = require("slugify");

class productController {
    add_product = async (req, res) => {
        const { id } = req;
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            let { name, category, description, stock, price, discount, shopName, brand } = field;
            const { images } = files;
            const slug = slugify(name.toString(), { replacement: "-", lower: true })
            try {
                let allImageUrl = [];

                for (let i = 0; i < images.length; i++) {
                    const result = await cloudinary.uploader.upload(images[i].filepath, { folder: 'products' })
                    allImageUrl = [...allImageUrl, result.url]
                }

                await productModel.create({
                    sellerId: id,
                    name:name.toString(),
                    slug,
                    shopName:shopName.toString(),
                    category: category.toString(),
                    description: description.toString(),
                    stock: parseInt(stock),
                    price: parseInt(price),
                    discount: parseInt(discount),
                    images: allImageUrl,
                    brand: brand.toString()

                })
                responseReturn(res, 201, { message: "Product added successfully" })
            } catch (error) {
                responseReturn(res, 500, { error: error.message })
            }

        })
    }
    products_get = async (req, res) => {
        const { page, searchValue, parPage } = req.query
        const { id } = req;

        const skipPage = parseInt(parPage) * (parseInt(page) - 1);

        try {
            if (searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalProduct = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).countDocuments()
                responseReturn(res, 200, { totalProduct, products })
            } else {
                const products = await productModel.find({ sellerId: id }).skip(skipPage).limit(parPage).sort({ createdAt: -1 })
                const totalProduct = await productModel.find({ sellerId: id }).countDocuments()
                responseReturn(res, 200, { totalProduct, products })
            }
        } catch (error) {
            responseReturn(res, 404, { error: error.message })
        }
    }

    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId)
            responseReturn(res, 200, { product })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    product_update = async (req, res) => {
        let { name, description, discount, price, brand, productId, stock } = req.body;
        const slug = slugify(name.toString(), { replacement: "-", lower: true })
        try {
            await productModel.findByIdAndUpdate(productId, {
                name, description, discount, price, brand, productId, stock, slug
            })
            const product = await productModel.findById(productId)
            responseReturn(res, 200, { product, message: 'product update success' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
    product_image_update = async (req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            const { productId, oldImage } = field;
            const { newImage } = files
            let filepath = newImage.map((item) => item.filepath);
            let path = filepath.toString();
            let old = oldImage.toString()
            let id = productId.toString()
            if (err) {
                responseReturn(res, 404, { error: err.message })
            } else {
                try {
                    
                    const result = await cloudinary.uploader.upload(path, { folder: 'products' })

                    if (result) {
                        let { images } = await productModel.findById(id)
                        const index = images.findIndex(img => img === old)
                        images[index] = result.url;

                        await productModel.findByIdAndUpdate(id, {
                            images
                        })

                        const product = await productModel.findById(productId)
                        responseReturn(res, 200, { product, message: 'product image update success' })
                    } else {
                        responseReturn(res, 404, { error: 'image upload failed' })
                    }
                } catch (error) {
                    responseReturn(res, 404, { error: error.message })
                }
            }
        })
    }
}

module.exports = new productController()