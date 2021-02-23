const express = require('express')
const router =new express.Router()
const Task = require('../models/task')
const auth = require('../auth/auth')
const multer = require('multer')
// const sharp = require('sharp')
const cloudinary = require('cloudinary')


router.post('/task', auth, async (req, res) => {
    
    const task = new Task({ ...req.body, owner: req.user._id })
    try {
        await task.save()
        res.status('200').send(task)
    } catch (e) {
        res.status('400').send(e)
    }
})

router.get('/task/one',auth ,async (req, res) => {
    try {
        // const task = await Task.find({owner:req.user._id})
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.send(e)
    }
})

router.patch('/task/update/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = [ 'prodName', 'price', 'details', 'stock']
    const isValidUpdate = updates.every((update) => allowedUpdate.includes(update))
    if(!isValidUpdate){res.send('not allowed')}
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id })
        // const task = await Task.findById(req.params.id)
        if (!task) { res.status('404').send() }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.send(e)
    }
})

router.delete('/task/delete/:id',auth ,async (req, res) => {
    try {
        // await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if (!task) { res.status('404').send() }
        res.send(task)
    } catch (e) {
        res.send(e)
    }
})

// cloudinary line
var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function (req, file, cb) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
const uploads = multer({ storage: storage, fileFilter: imageFilter })
cloudinary.config({
    cloud_name: 'do1ztuacw',
    api_key: '149988255623473',
    api_secret:'dG8X7emndqfcqgWpGNLs2s4Iikg'
})
// cloudinary lines

// const uploads = multer({
//     limits: {
//         fileSize:1000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('please upload a valid image '))
//         }
//         return cb(undefined,true)
//     }
// })
router.post('/task/image/:id', uploads.single('image'),auth, async (req, res, next) => {
    // const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 200 }).png().toBuffer()
    const result = await cloudinary.uploader.upload(req.file.path)
    try {
        const task = await Task.findById(req.params.id)
        task.image = result.secure_url
        await task.save()
        res.send('image uploaded')
    } catch (e) {
        res.send(e)
    }
})


router.get('/task/taskUse', async (req, res) => {
    try {
        const task = await Task.find()
        res.send(task)
    } catch (e) {
        res.send(e)
    }
})


module.exports = router