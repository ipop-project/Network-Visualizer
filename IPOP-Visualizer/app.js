const express = require('express');
const parser = require('body-parser');
const path = require('path');
const app = express();

app.use(parser.urlencoded({extended:false}));
app.use(parser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/min', express.static(path.join(__dirname, 'node_modules')));
var port = 3000;

/*real new data */
var newData = require("./public/JSON/new_ipop.json");

/*real data */
var ipopData = require("./public/JSON/ipopData.json");

app.get('/', function (req, res) { //use absolute path to html file
    console.clear()
    res.sendFile(path.join(__dirname, '/public/HTML/ipop.html'));
});

app.get('/detail.html', function (req, res) { //use absolute path to html file
    console.clear()
    res.sendFile(path.join(__dirname, '/public/HTML/detail.html'));
});

app.get('/edge_detail.html', function (req, res) { //use absolute path to html file
    console.clear()
    res.sendFile(path.join(__dirname, '/public/HTML/edge_detail.html'));
});



app.get('/ortherNodeDetail.html', function (req, res) { //use absolute path to html file
    console.clear()
    res.sendFile(path.join(__dirname, '/public/HTML/ortherNodeDetail.html'));
});


app.get('/icons.html', function (req, res) { //use absolute path to html file
    console.clear()
    res.sendFile(path.join(__dirname, '/public/HTML/icons.html'));
});

app.get('/newData', (req, res) => {
    res.json({
      statusCode: "200 Success",
      ipop: newData    });
});

app.get('/ipopData', (req, res) => {
    res.json({
      statusCode: "200 Success",
      ipop: ipopData
    });
});


app.listen(port, function () { 
    console.log('Server Start port: ' + port);
});
  