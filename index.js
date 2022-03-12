var http = require('http');
const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');

//TODO: aqui tem que botar uma variavel de ambiente
const carteiraServiceProxy = httpProxy('http://localhost:5001');
//const pessoasServiceProxy = httpProxy('http://localhost:3003');

// Proxy request
// rota para carteira e todos os métodos
app.all('/carteira', (req, res, next) => {
    carteiraServiceProxy(req, res, next);
})
// rota para carteira e todos os métodos com um parâmetro ID
app.all('/carteira/:id', (req, res, next) => {
    carteiraServiceProxy(req, res, next);
})
// rota para pessoas e todos os métodos
app.all('/ativo', (req, res, next) => {
    pessoasServiceProxy(req, res, next);
})
// rota para pessoas e todos os métodos com um parâmetro ID
app.all('/ativo/:id', (req, res, next) => {
    pessoasServiceProxy(req, res, next);
})

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

var server = http.createServer(app);
server.listen(5000);