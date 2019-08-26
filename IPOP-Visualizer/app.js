const express = require('express');
const parser = require('body-parser');
const path = require('path');
const app = express();

app.use(parser.urlencoded({extended:false}));
app.use(parser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/min', express.static(path.join(__dirname, 'node_modules')));
var port = 3000;

var user_routers = require('./routes/user_routers')
app.use('/', user_routers);


app.listen(port, function () { 
    console.log("*********************************************");
    console.log('IPOP Visualizer starts at port: ' + port);
    console.log('To stop the IPOP Visualizer just enter ctrl + c');
    console.log("*********************************************");
});

