const express = require('express');
const path = require('path');
const router = express.Router();

var user_controllers = require('../controllers/user_controllers');

router.get('/', user_controllers.get_landing_page);
router.get('/icons.html', user_controllers.get_icons_page);
router.get('/detail.html', user_controllers.get_detail_page);
router.get('/ortherNodeDetail.html', user_controllers.get_ortherNodeDetail_page);
router.get('/edge_detail.html', user_controllers.get_edge_detail_page);
router.get('/server_ip', user_controllers.get_server_config);


module.exports = router;
