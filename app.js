const router = require("./router.js");

//Create a web server
const http = require('http');
const hostname = '127.0.0.1'; //this IP adress corresponds to localhost
const port = process.env.PORT || 3000; //process.env.PORT means whatever is the environment variable PORT
const server = http.createServer((req, res) => { //request, response
    router.static(req, res);
    router.home(req, res);
    router.explanation(req, res);
    router.wheel(req, res);
});
server.listen(port, () => { //the hostname is optional
  console.log(`Server running on port ${port}/`);
});