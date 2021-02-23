const express = require('express')
const router =new express.Router()
const User = require('../models/user')
const auth = require('../auth/auth')

router.post('/user', async (req, res) => {
        const user = new User(req.body)
    try {
        await user.save()
        const token = await user.genAuthToken()
        res.status('200').send({user,token})
    } catch (e) {
        res.status('400').send(e)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCred(req.body.email, req.body.password)
        // console.log(user)
        const token = await user.genAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status('404').send(e)
    }
})
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('logout successfully')
    } catch (e) {
        res.send(e)
    }
})
router.patch('/user/update',auth, async (req, res) => {
    
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'email', 'age', 'password']
        const isOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isOperation) { res.status('404').send('invalid update') }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        // if (!user) {
        //     res.status('404').send()
        // }
        res.status('201').send(user)
    } catch (e) {
        res.status('400').send(e)
    }
})

router.delete('/user/delete',auth, async (req, res) => {
    try {
       req.user.remove()
       res.status('201').send(req.user)
    } catch (e) {
        res.send(e)
    }
})

module.exports = router