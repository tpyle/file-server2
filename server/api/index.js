const express = require('express');
const router = express.Router();
const routerv1 = require('./v1');

router.use('/v1', routerv1);

router.use('*',(_,res)=>{
    res.sendStatus(404);
})

module.exports = router;