const adminModel = require("../models/adminModel");
const sellerModel = require('../models/sellerModel')
const sellerCustomerModel = require('../models/chat/sellerCustomerModel')
const bcrpty = require('bcrypt')
const { responseReturn } = require("../utils/response");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createToken } = require("../utils/tokenCreate");
const cloudinary = require('../utils/cloudinaryConfig');
const { formidable } = require('formidable');
class authControllers {
    admin_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            const admin = await adminModel.findOne({ email }).select('+password');
            if (admin) {
                const match = await bcrypt.compare(password, admin.password)
                if (match) {
                    const token = await createToken({
                        id: admin.id,
                        role: admin.role,
                        userInfo: admin
                    });
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    })
                    responseReturn(res, 200, { token,  message: "Logged In !" })
                } else {
                    responseReturn(res, 404, { error: "Password Incorrect" })
                }
            } else {
                responseReturn(res, 404, { error: "Email not found" })
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    };
    seller_login = async (req, res) => {
        const { email, password } = req.body
        try {
            const seller = await sellerModel.findOne({ email }).select('+password')
            if (seller) {
                const match = await bcrpty.compare(password, seller.password)
                if (match) {
                    const token = await createToken({
                        id: seller.id,
                        role: seller.role,
                        userInfo: seller
                    })
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    })
                    responseReturn(res, 200, { token, message: 'Login success' })
                } else {
                    responseReturn(res, 404, { error: "Password wrong" })
                }
            } else {
                responseReturn(res, 404, { error: "Email not found" })
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    seller_register = async (req, res) => {
        const { email, name, password } = req.body
        try {
            const getUser = await sellerModel.findOne({ email })
            if (getUser) {
                responseReturn(res, 404, { error: 'Email alrady exit' })
            } else {
                const seller = await sellerModel.create({
                    name,
                    email,
                    password: await bcrpty.hash(password, 10),
                    method: 'menualy',
                    shopInfo: {}
                })
                await sellerCustomerModel.create({
                    myId: seller.id
                })
                const token = await createToken({ id: seller.id, role: seller.role })
                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                })
                responseReturn(res, 201, { token, userInfo: seller, message: 'register success' })
            }
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    getUser = async (req, res) => {
        const { id, role } = req;

        try {
            if (role === 'admin') {
                const user = await adminModel.findById(id)
                responseReturn(res, 200, { userInfo: user })
            } else {
                const seller = await sellerModel.findById(id)
                responseReturn(res, 200, { userInfo: seller })
            }
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error' })
        }
    }

    profile_image_upload = async (req, res) => {
        const { id } = req
        const form = formidable({ multiples: true })
        form.parse(req, async (err, _, files) => {
            const { image } = files
            let filepath = image.map((item) => item.filepath);
            let path = filepath.toString()
            try {
                const result = await cloudinary.uploader.upload(path, { folder: 'profile' })
                if (result) {
                    await sellerModel.findByIdAndUpdate(id, {
                        image: result.url
                    })
                    const userInfo = await sellerModel.findById(id)
                    responseReturn(res, 201, { message: 'Image upload success', userInfo })
                } else {
                    responseReturn(res, 404, { error: 'image upload failed' })
                }
            } catch (error) {
                //console.log(error)
                responseReturn(res, 500, { error: error.message })
            }
        })
    }

    profile_info_add = async (req, res) => {
        const { division, district, shopName, sub_district } = req.body;
        const { id } = req;

        try {
            await sellerModel.findByIdAndUpdate(id, {
                shopInfo: {
                    shopName,
                    division,
                    district,
                    sub_district
                }
            })
            const userInfo = await sellerModel.findById(id)
            responseReturn(res, 201, { message: 'Profile info add success', userInfo })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

    logout = async (req, res) => {
        try {
            res.cookie('accessToken', null, {
                expires: new Date(Date.now()),
                httpOnly: true
            })
            responseReturn(res, 200, { message: 'logout success' })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }

}

module.exports = new authControllers;