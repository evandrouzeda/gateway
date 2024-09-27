require('dotenv').config()
const app = require( "./app/index");
const http = require('http');

var server = http.createServer(app);
server.listen(5000);