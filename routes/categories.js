var express = require('express');
var path =require('path');
var router = express.Router();
var mongo = require('mongodb');
var multer = require('multer');
var db =require('monk')('localhost/nodeblog');

router.get('/show/:category', function(req,res,next){
    var db = req.db;
    var posts = db.get('posts');
    posts.find({category: req.params.category},{}, function(err, posts){
        res.render('index', {
            "title": req.params.category,
            "posts": posts
        })
    });
});

router.get('/add', function(req, res, next) {
    res.render('addcategory', {
        "title": "Add Category"
    });
});


var storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, './public/images/uploads')
    },
    filename: function(req,file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

router.post('/add',upload.any(), function(req,res,next){
    var title = req.body.title;
    if(req.file){
        ;
    } else {
        ;
    }
    
    req.checkBody('title', 'Title field is required').notEmpty();
    
    var errors = req.validationErrors();
    
    if(errors){
        res.render('addcategory', {
            "title": "Add Category",
            "errors": errors
        });
    } else {
        var categories = db.get('categories');
        
        categories.insert({
            "title": title
        }, function(err, category){
            if(err)
            {
                res.send('There was an error sumbitting category');
            } else {
                req.flash('success','Category Submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});
module.exports = router;
