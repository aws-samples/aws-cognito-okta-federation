config = {
    service: {
        port: 3000
    },
    auth: {
        clientId: 'TAKE FROM CDK DEPLOY OUTPUT',
        redirectUri: 'http://localhost:3000/authcode',// change the port if you are changing the value above
        cognitoLoginUrl: 'TAKE FROM CDK DEPLOY OUTPUT, with pattern https://{COGNITO DOMAIN}.auth.{REGION}.amazoncognito.com'
    },
    apiGateway: {
        endPointUri: 'TAKE FROM CDK DEPLOY OUTPUT, with pattern {SOME ID}.execute-api.{REGION}.amazonaws.com',
        stage: 'prod',
    }
};

module.exports = { config };