const router = require('express').Router();
const depositCtrl = require('../controllers/deposit.controller');

router.get('/', depositCtrl.getActiveDepositMethods); // public route for users

module.exports = router;
