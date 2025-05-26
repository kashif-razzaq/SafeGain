const router = require('express').Router();
const pkgController = require('../controllers/package.controller');

router.get('/', pkgController.getAllPackages); // Public endpoint

module.exports = router;
