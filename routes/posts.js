var express = require('express');
var path =require('path');
var router = express.Router();
var mongo = require('mongodb');
var multer = require('multer');
var db =require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req,res, next){
    var posts = db.get('posts');
    posts.findOne(req.params.id, function(err, post){
        res.render('show', {
            "post": post
        });
    });
});

router.get('/add', function(req,res,next){
    var categories = db.get('categories');
    
    categories.find({},{}, function(err, categories){
        res.render('addpost', {
        "title": "Add Posts" ,
        "categories": categories
    });
    });
    
});
var Name;
var storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, './public/images/uploads')
    },
    filename: function(req,file, cb) {
        Name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

router.post('/add',upload.single('mainimage'), function(req,res,next){
    //get the form values
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();
    console.log(title);
    if(req.file){
        var mainImageOrgName = req.file.originalname;
        var mainImageName= req.file.name;
        var mainImageMime = req.file.mimetype;
        var mainImagePath = req.file.path;
        var mainImageExt= req.file.extension;
        var mainImageSize= req.file.size;
        //console.log(req.file.name);
    }
    else {
        Name= 'noimage.png';
    }
    
    // Form Validation
    req.checkBody('title', 'Title Field is required').notEmpty();
    req.checkBody('body', 'Body is required');
    
    
    // Check Errors
    var errors = req.validationErrors();
    if(errors){
        res.render('addpost', {
            "errors": errors,
            "title": title,
            "body": body
        });
    } else {
        var posts = db.get('posts');
        
        // Sumbit to db
        posts.insert({
           "title": title,
            "body": body,
            "category": category,
            "date": date,
            "author": author,
            "image": Name
        }, function(err, post){
            if(err){
                res.send('There was an issue submittin the post');
            } else {
                req.flash('success', 'Post submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
    
});

router.post('/addcomment', function(req,res,next){
    //get the form values
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();
    //console.log(title);
    
    
    // Form Validation
    req.checkBody('name', 'Title Field is required').notEmpty();
    req.checkBody('email', 'Email Field is required').notEmpty();
    req.checkBody('email', 'Email Field is not valid').isEmail();
    req.checkBody('body', 'Body is required').notEmpty();
    
    
    // Check Errors
    var errors = req.validationErrors();
    if(errors){
        var posts = db.get('posts');
        posts.findOne(postid, function(err,post){
            res.render('show', {
                "errors": errors,
                "post": post
            });
        });
        
    } else {
        var comment = {"name": name, "email": email, "body": body, "commentdate": commentdate};
        
        var posts = db.get('posts');
        // Sumbit to db
        posts.update({
            "_id": postid
            },
            {
            $push:{
                "comments": comment
            }
        },
        function(err, doc){
            if(err){
                throw err;
            } else {
                req.flash('success', 'Comment Added');
                res.location('/posts/show/' +postid);
                res.redirect('/posts/show/' +postid);
            }
        }
        );
    }
    
});

module.exports = router;