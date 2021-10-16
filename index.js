const express = require('express');
const app = express()
const bodyParser = require("body-parser")
const connection = require('./database/database')
const sessions = require('express-session')

const categoriesController = require ('./categories/CategoriesController')
const articlesController = require ('./articles/ArticlesController')
const usersController = require('./users/UsersController');


const Category = require('./categories/Category')
const Articles = require('./articles/Article');
const User = require('./users/User');

//config view
app.set("view engine", "ejs")
//sessions
app.use(sessions({
  secret:'asashaiiod9owldxpweiwsdalspqeioslmdcjolwskldxclo',
  cookie:{
    maxAge:30000
  }
}))

//config bodyParser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//config static
app.use(express.static("public"))

// database
connection
    .authenticate()
    .then(()=>{
        console.log("sucesso")
    })
    .catch((error) => {
         console.log(error)
    })


app.use('/', categoriesController)
app.use('/', articlesController)
app.use('/', usersController)

app.get("/", (req, res) =>{
    Articles.findAll({
        order:[
            ['id', 'DESC']
        ],
        limit:4
    }).then(articles =>{
      Category.findAll().then(categories =>{
        res.render('index',{
          articles: articles, 
          categories: categories
         })
      })
    })
})

app.get("/:slug", (req, res) =>{
  var slug = req.params.slug;
  Articles.findOne({
      where:{
          slug : slug
      }
  }).then(article => {
    if(article != undefined){
      Category.findAll().then(categories => {
        res.render("article", {
          article: article, 
          categories: categories
        });
      });
    }else{
      res.redirect("/");
    }
  }).catch(err => {
    res.redirect("/");
  });

})

app.get("/category/:slug", (req, res) => {
  var slug = req.params.slug;
  Category.findOne({
    where: {
      slug: slug
    },
    include: [{model: Articles}]
  }).then( category => {
    if (category != undefined){

      Category.findAll().then(categories => {
        res.render("index", {articles: category.articles, categories: categories});
      });
    }else{
      res.redirect("/");
    }
  }).catch( err => {
    res.redirect("/");
  });
});


app.listen(8080, ()=>{
    console.log("rodando")
})