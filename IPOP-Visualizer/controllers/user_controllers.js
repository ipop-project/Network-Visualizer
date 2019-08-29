const path = require('path');

exports.get_landing_page = (req, res) => {
    //console.log("1"+req.url);
    res.sendFile(path.join(__dirname, '../public/views/overlays_page.html'));
}

exports.get_icons_page = (req, res) => {
    //console.log("2" + req.url);
    res.sendFile(path.join(__dirname, '../public/views/icons.html'));
}

exports.get_detail_page = (req, res) => {
    //console.log("3" + req.url);
    res.sendFile(path.join(__dirname, '../public/views/detail.html'));
}

exports.get_ortherNodeDetail_page = (req, res) => {
    //console.log("4" + req.url);
    res.sendFile(path.join(__dirname, '../public/views/ortherNodeDetail.html'));
}

exports.get_edge_detail_page = (req, res) => {
    //console.log("5" + req.url);
    res.sendFile(path.join(__dirname, '../public/views/edge_detail.html'));
}

exports.get_server_config = (req, res) => {
    var data = require('../config/config.json');
    res.json(data);
}