const express = require('express');
const router = express.Router();
const Post = require('./../models/post')

router.get('/', (req, res) => {
    Post.find({}, (error, posts) => {
        if(error){
            console.log(error);
        } else {
            res.render('index', { posts: posts });
        }
    })
});

router.get('/new', (req, res) => {
    let post = {topic: "", name: "", message: ""};
    res.render('new', {post: post})
});

router.get('/edit/:id', (req, res) => {
    Post.findById(req.params.id, (error, post) => {
       if(error){
        console.log(error);
        res.redirect('/')
       } else {
        res.render('edit', {post: post})
       }
    })
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id, (error, post) => {
        if(error){
            console.log(error);
            res.redirect('/');
        } else {
            console.log(post);
            res.render('show', {post: post})
        }
    })
})

router.post('/', (req, res) => {
    let thePost = new Post({
        topic: req.body.topic, 
        message: req.body.message, 
        name: req.body.name
    });
    thePost.save((error, post) => {
        if(error) {
            console.log(error);
            res.render('new', {post: thePost})
        } else {
            console.log(post);
            res.redirect(`/posts/${post._id}`);
        }
    });
});

router.put('/:id', (req, res) => {
    Post.findByIdAndUpdate({_id: req.params.id}, {
        topic: req.body.topic,
        message: req.body.message,
        name: req.body.name
    }, (error, post) => {
        if(error){
            console.log(error);
        } else {
            res.redirect(`/posts/${post._id}`);
        }
    });
});

router.delete('/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id, (error, post) => {
        if(error){
            console.log(error)
        } else {
            console.log('This was deleted: ', post)
            res.redirect('/')
        }
    });
});


module.exports = router;