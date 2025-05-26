const router = require('express').Router();
const authMiddleware  = require('../middleware/authMiddleware');
const invest = require('../controllers/investment.controller');

router.post('/', authMiddleware, invest.createInvestment);
router.get('/my', authMiddleware, invest.getMyInvestments);

module.exports = router;
