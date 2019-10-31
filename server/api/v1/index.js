const express = require('express');
const router = express.Router();
const data = require('./data');
const path = require('path');
const fs = require('fs');
const { baseFilePath } = require('../../config')({ defaultConfig: { baseFilePath: path.join(require('os').tmpdir(),'fsv') } });

router.get('/file/*',(req,res)=>{
    /**
     * This route is for sending the file designated by filepath to the user in
     * question 
     */
    let filepath = req.url.slice(5);
    if (filepath.split('/').indexOf('..') > -1) {
        return res.sendStatus(400);
    }
    filepath = path.join(baseFilePath,req.session.username,filepath);
    res.sendFile(filepath, (err)=>{
        if (err) {
            if (err.code === 'ENOENT') {
                return res.sendStatus(404);
            }
            console.error(err);
            res.sendStatus(500);
        }
    });
});

router.get('/files/*',(req,res)=>{
    /**
     * This route is for getting the contents of the directory specified by the file path after '/files'
     */
    fs.mkdir(path.join(baseFilePath,req.session.username), { recursive: true },(err)=>{
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        let filepath = req.url.slice(6);
        if (filepath.split('/').indexOf('..') > -1) {
            return res.sendStatus(400);
        }
        filepath = path.join(baseFilePath,req.session.username,filepath);
        fs.readdir(filepath,{ withFileTypes: true },(err,files)=>{
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            files = files
                        .filter(dirent=>!(dirent.isFIFO() || dirent.isSocket() || dirent.isSymbolicLink() || dirent.isCharacterDevice() || dirent.isBlockDevice()))
                        .map(dirent=>({ name: dirent.name, isDirectory: dirent.isDirectory() }));
            res.send(files);
        });
    });
});

module.exports = router;