import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Authenticator } from './authenticator';
import { ApiGateway } from './api-gateway';

import { Config } from './config';
let config: Config = require('./config.json');

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const namePrefix = 'Okta';
    const authenticatorName = `${namePrefix}Auth`;
    const apiGatewayName = `${namePrefix}Api`;

    // Cognito Authentication with Okta federation
    const authenticator = new Authenticator(this, authenticatorName, {
      clientId: config.oktaClientId,
      clientSecret: config.oktaClientSecret,
      issuerUrl: config.oktaIssuerUrl,
      appClientCallbackUrl: config.appClientCallbackUrl,
      userPoolCognitoDomain: config.userPoolCognitoDomain
    });
    
    // Endpoint Lambda handler
    const hello = new lambda.Function(this, 'HelloHandler',{
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler'
    })

    // API Gateway
    const api = new ApiGateway(this, apiGatewayName, {
      userpool: authenticator.userpool,
      helloHandler: hello
    });
  }
}
