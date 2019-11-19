var router    = require('express').Router()
	, jwt       = require('jsonwebtoken')
  
/*****************************
 EXPORTS
 *****************************/

// Send back the configurations of the server
router.get('/', isTokenValid, function (req, res) {

  let payload = {
    serverConfig: MMO_Core["database"].SERVER_CONFIG,
    gameData: MMO_Core["gamedata"].data,
  }

	res.status(200).send(payload);
});

// Send back the configurations of the server
router.patch('/:type', isTokenValid, function (req, res) {
  if(!req.body) return;

  MMO_Core["database"].changeConfig(req.params.type, req.body, () => {
	  res.status(200).send(true);
  })
});

/*****************************
 FUNCTIONS
 *****************************/

module.exports = router;