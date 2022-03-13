var http = require('http');
require('dotenv').config()
const express = require('express')
const httpProxy = require('express-http-proxy')
const app = express()
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const Mongodb = require('./config/mongodb');

//TODO: aqui tem que botar uma variavel de ambiente
function addSession(req) {
    const [path, params] = req.url.split("?")
    return `${path}?${params ? params + "&" : ""}${new URLSearchParams(req.session).toString()}`
}

const carteiraServiceProxy = httpProxy(process.env.SERVER_CARTEIRA, {
    proxyReqPathResolver: addSession,
});
const ativoServiceProxy = httpProxy(process.env.SERVER_ATIVO, {
    proxyReqPathResolver: addSession,
});
const bodyParser = require('body-parser');

app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function verificaJWT(request, response, next) {
    const token = request.headers['x-access-token'];
    if (!token) return response.status(401).json({ auth: false, message: 'Nenhum token recebido.' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) return response.status(500).json({ auth: false, message: 'Erro ao autenticar o token.' });

        // Se o token for válido, salva no request para uso posterior
        request.session = {
            userid: decoded._id,
            username: decoded.username
        }
        next();
    });
}
// Proxy request
// rota para carteira e todos os métodos
app.all('/carteira', verificaJWT, (req, res, next) => {
    carteiraServiceProxy(req, res, next);
})
// rota para carteira e todos os métodos com um parâmetro ID
app.all('/carteira/:id', verificaJWT, (req, res, next) => {
    carteiraServiceProxy(req, res, next);
})
// rota para ativo e todos os métodos
app.all('/ativo', verificaJWT, (req, res, next) => {
    ativoServiceProxy(req, res, next);
})
// rota para ativo e todos os métodos com um parâmetro ID
app.all('/ativo/:id', verificaJWT, (req, res, next) => {
    ativoServiceProxy(req, res, next);
})

const mongodb = new Mongodb()
app.post("/login", async (request, response, next) => {
    const db = await mongodb.getDB()
    const { username, password } = request.body
    db.collection("Usuarios").findOne({ username, password })
        .then(result => {
            if (result && Object.values(result).length) {
                const session = {
                    _id: result._id,
                    username
                }
                response.status(200).json({
                    status: "success",
                    token: jwt.sign(session, process.env.ACCESS_TOKEN_SECRET)
                })
            } else response.status(300).json({ msg: "unvalid login" })
        })
        .catch(error => response.status(500).json({ status: 'error', message: 'Erro: ' + error }))
})

app.use(logger('dev'));

var server = http.createServer(app);
server.listen(5000);