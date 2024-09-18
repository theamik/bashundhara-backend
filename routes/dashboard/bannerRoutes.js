const router = require('express').Router()
const { authMiddleware } = require('../../middlewares/authMiddleware')
const bannerController = require('../../controllers/dashboard/bannerController')

router.post('/banner-add', authMiddleware, bannerController.add_banner)
router.get('/banner-get/:productId', authMiddleware, bannerController.get_banner)
router.get('/banners-get', bannerController.get_banners)

module.exports = router
