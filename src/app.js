const express = require('express')
const app = express()
const { config } = require('./config.js')
const https = require('https');

var idToken = null; // the access token should not be stored here, this is for illustration purpose only

app.get('/login', function(req, res) {
  const hostedUI = `https://${config.auth.cognitoLoginUrl}/oauth2/authorize?client_id=${config.auth.clientId}&response_type=code&scope=email+openid&redirect_uri=${config.auth.redirectUri}`;
  res.redirect(hostedUI);
});

app.get('/authcode', (req, res) => {
  const postData = `grant_type=authorization_code&client_id=${config.auth.clientId}&redirect_uri=${config.auth.redirectUri}&code=${req.query.code}`;

  const options = {
      host: config.auth.cognitoLoginUrl,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
  };

  const tokenReq = https.request(options, (tokenRes) => {
    console.log('STATUS: ', tokenRes.statusCode);
    console.log('HEADERS: ', JSON.stringify(tokenRes.headers));
    tokenRes.setEncoding('utf8');

    tokenRes.on('data', (body) => {
      const tokenResJSON = JSON.parse(body);
      if ('id_token' in tokenResJSON) {
        idToken = tokenResJSON.id_token;
        console.log('ID_TOKEN: ', idToken);
      }
      res.redirect('./home.html');
    });
  });
    
  tokenReq.on('error', (e) => {
      console.error(e);
      return res.status(400).send({
        message: e.message
      });
  });
  
  tokenReq.write(postData);
  tokenReq.end();
})

app.get('/hello', function(req, res) {
  if (idToken == null) {
    return res.status(400).send({
      message: 'Token missing'
    });
  }

  const options = {
    host: config.apiGateway.endPointUri,
    method: 'GET',
    path: `/${config.apiGateway.stage}/hello`,
    headers: {
      'Authorization': idToken
    }
  };

  const apiReq = https.request(options, function(apiRes) {
    console.log('STATUS: ', apiRes.statusCode);
    console.log('HEADERS: ', JSON.stringify(apiRes.headers));
    apiRes.setEncoding('utf8');

    apiRes.on('data', (data) => {
      console.log('DATA: ', data);
      res.send(data);
    });
  });

  apiReq.on('error', (e) => {
    console.error(e);
    return res.status(400).send({
      message: e.message
    })
  });

  apiReq.end();
});

app.use(express.static('./public'))

app.listen(config.service.port, () => {
  console.log(`App listening on port ${config.service.port}`)
})
