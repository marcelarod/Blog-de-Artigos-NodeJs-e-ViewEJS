const express = require('express');
const router = express.Router()
const Category = require('../categories/Category')
const Articles = require('./Article')
const slugify = require('slugify')
const adminAuth = require('../middlewares/adminAuth')

router.get("/admin/articles",adminAuth, (req, res) =>{
    Articles.findAll({
        include: [{model: Category}]
    }).then(articles =>{
        res.render('admin/articles/index',{
            articles: articles
        })
    })
})

router.get("/admin/articles/new", adminAuth,(req, res) =>{
    Category.findAll().then(categories =>{
        res.render('admin/articles/new',{
            categories: categories
        })
    })
})
router.post("/articles/save",adminAuth, (req, res) =>{
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category
    Articles.create({
            title:title,
            body: body,
            slug: slugify(title),
            categoryId:category
        }).then(()=>{
            res.redirect('/admin/articles')
        })
   
})

router.post("/articles/delete",adminAuth, (req, res) =>{
    var id = req.body.id
    if(id != undefined){
        if(!isNaN(id)){
            Articles.destroy({
                where:{
                    id:id
                }
            }).then(() => {
                res.redirect("/admin/articles")
            })
        }else{
            res.redirect("/admin/articles")
        }
        
    }else{
        res.redirect("/admin/categories")
    }
})
router.get("/admin/articles/edit/:id",adminAuth, (req, res) =>{
    var id = req.params.id

    Articles.findByPk(id).then(articles=>{
        if(articles != undefined){
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {categories:categories,article:articles})
              });
        }else{
            res.redirect("/admin/articles")
        }
    }).catch(error =>{
        res.redirect("/admin/articles")
    })
    
})

router.post("/articles/update", adminAuth,(req, res) =>{
    var id = req.body.id
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category
    Articles.update({title:title, body:body, categoryId:category, slug:slugify(title)},{
         where:{
            id:id
        }
    }).then(() => {
        res.redirect("/admin/articles")
    }).catch(error =>{
        res.redirect("/admin/articles")
    })
})
router.get('/articles/page/:num', (req,res) => {
    let page = req.params.num;
    let offset = 0;
    var pageLimit = 4;

    if(isNaN(page) || page == 1){
        offset = 0 
    }else{
        offset = (parseInt(page)-1)* pageLimit; 
    }

    Articles.findAndCountAll({
        limit: pageLimit,
        offset: offset,
        order: [['id','DESC']]
    }).then(articles => {
        let next;

        if(offset + pageLimit >= articles.count){ 
            next = false 
        }else{ 
            next = true;
        }

        let result = {
            next: next,
            page: parseInt(page),
            articles: articles
        }
        Category.findAll().then(categories => {
            res.render('admin/articles/page', {result: result, categories: categories})
        })
    })
});

 module.exports = router