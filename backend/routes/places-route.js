const express= require('express');
const {check} =  require('express-validator');
const { getPlaceByPlaceId, getPlacesByUserId, createPlace, updateByPlaceId, deleteByPlaceId } = require('../controllers/places-cotroller');
const HttpError = require('../models/http-error');
const router= express.Router();
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

// url- /api/places/p1
router.get('/:pid',getPlaceByPlaceId);

// url- /api/places/users/u1
router.get('/user/:uid',getPlacesByUserId);

router.use(checkAuth);

router.post('/',
    fileUpload.single('image'),
    [
        check('title')
        .not()
        .isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address')
        .not()
        .isEmpty()
    ],
    createPlace);

router.patch('/:pid',
    [
        check('title')
        .not()
        .isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    updateByPlaceId);

router.delete('/:pid',deleteByPlaceId);

module.exports=router;
