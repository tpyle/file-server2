const express = require('express');
const router = express.Router();
const routerv1 = require('./v1');
const axios = require('axios');
const { authPing, authCheck } = require('../config')({ defaultConfig: { authPing: undefined, authCheck: undefined } });

router.use(async (req,res,next)=>{
    let cookieId = req.cookies.SID;
    try {
        if (req.url === '/v1/ping') {
            if ( authPing === undefined ) {
                return res.sendStatus(200);
            }
            let response = await axios.get(`${authPing}${cookieId}`, { withCredentials: true });
            return res.sendStatus(response.status);
        }
        if (authCheck === undefined) {
            req.session = { status: true, username: 'user' };
            return next();
        }
        if ( cookieId === undefined ) {
            res.sendStatus(403);
        } else {
            let response = await axios.get(`${authCheck}${cookieId}`, { withCredentials: true });
            if (response.data.status) {
                req.session = response.data;
                next()
            } else {
                res.sendStatus(403);
            }
        }
    } catch {
    	res.sendStatus(403);
    }
});

router.use('/v1', routerv1);

router.use('*',(_req,res)=>{
    res.sendStatus(404);
})

module.exports = router;