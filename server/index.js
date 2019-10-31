const express = require('express');
const BodyParser = require('body-parser');
const CookieParser = require('cookie-parser');
const path = require('path');
const router = require('./api');
const config = require('./config')({ defaultConfig: { port: 3002 } })

let app = express();

app.use(BodyParser.json());
app.use(CookieParser());

app.use('/api', router);

app.use(express.static(path.join(__dirname, 'build')));

app.get((_req, res)=>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(config.port, ()=>{
    console.log(`Now listening on port ${config.port}`);
});
