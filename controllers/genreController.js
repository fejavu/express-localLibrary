var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const {body, validationResult } = require('express-validator/check') ;
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    
    Genre.find()
    .sort([['genre_name','ascending']])
    .exec(function(err, list_genres){
        if(err){ return next(err); }
        res.render('genre_list', {title:'Genre List',genre_list:list_genres});
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res,next) {
    
    async.parallel({
        genre:function(callback){
            Genre.findById(req.params.id)
            .exec(callback);
        },

        Genre_books:function(callback){
            Book.find({'genre':req.params.id})
            .exec(callback);
        },
    },function(err, results){
        if(err){ return next(err); }
        if(results.genre==null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        //If successful ,render
        res.render('genre_detail', {title:'Genre Detail', genre:results.genre, genre_books:results.Genre_books});
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', {title:'Create Genre',});
};

// Handle Genre create on POST.
exports.genre_create_post = [

    //Validate that the name field is not empty
    body('name', 'Genre name required').isLength({min:1}).trim(),

    //Sanitize(trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    //Process request after validation and sanitization.
    (req, res,next) =>{

        //Extract the validation errors from a req
        const errors = validationResult(req);

        //Create a genre object with escaped and trimmed data
        var genre = new Genre({name: req.body.name});

        if(!errors.isEmpty()){
            //Data from form id invalid, render the errors.
            res.render('genre_form',{title:'Create Genre', genre:genre, errors:errors.array()});
            return;
        }else{
            //Data from form is valid.
            //Check if genre with same name already exists.
            Genre.findOne({'name':req.body.name})
            .exec( function(err, found_genre){
                if(err) { 
                    return next(err); 
                }
                if(found_genre) {
                    res.redirect(found_genre.url);
                }else{

                    genre.save(function(err){
                        if(err) { return next(err); }
                        //Genre saved.Redirect to genre detail page.
                        res.redirect(genre.url);
                    });
                }
            });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    
    async.parallel({
        genres: function(callback){
            Genre.findById(req.params.id).exec(callback);
        },
        books:function(callback){
            Book.find({'genre':req.params.id}).exec(callback);
        },
    },function(err, results) {
        if(err) {return next(err);}
        if(results.genres == null){
            res.redirect('/catalog/genres');
        }
        res.render('delete_genre', {title:'Delete Genre', genres:results.genres, books:results.books});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    
    async.parallel({
        genre:function(callback) {
            Genre.findById(req.body.genreid).exec(callback)
        },
        books:function(callback) {
            Book.find({'genre':req.body.genreid}).exec(callback)
        }, 
    },function(err, results) {
        if(err) {return next(err); }

        //Successful
        if(results.books.length > 0){
            //Genre has books. Render in same way as for GET route
            res.render('delete_genre', {title:'Delete Genre', genre:results.genre, books:results.books} );
            return ;
        }else{
            //Author has no books. Delete object and redirect to the author list.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err){
                if(err) { return next(err); }
                res.redirect('/catalog/genres');
            })
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    Genre.findById(req.params.id, function(err, genre){
        if(err) {return next(err);}
        if (genre == null){
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_form', {title:'Update Genre',genre:genre});
    });
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name','Genre name required').isLength({min:1}).trim(),

    sanitizeBody('name').trim().escape(),

    (req, res, next) => {

        const error = validationResult(req);
        
        //Create a genre object with escaped and trimmed data
        var genre = new Genre({
            name: req.body.name,
            _id:req.params.id,
        });

        if(!error.isEmpty()){
            res.render('genre_form',{title:'Update Genre', genre:genre,error:error.array(),});
            return ;
        }else {
            Genre.findByIdAndUpdate(req.params.id,genre,{},function(err, thegenre){
                if(err) { return next(err);}
                res.redirect(thegenre.url);
            });
        }
    }
];