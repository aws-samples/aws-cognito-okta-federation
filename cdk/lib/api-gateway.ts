import { CfnOutput } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface ApiGatewayProps {
    userpool: IUserPool,
    helloHandler: lambda.IFunction;
}

export class ApiGateway extends Construct {

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const api = new apigw.RestApi(this, id, {
        restApiName: id,
    });
    
    const auth = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [props.userpool]
    });
    
    const endpoint = api.root.addResource('hello');
    endpoint.addMethod('GET', new apigw.LambdaIntegration(props.helloHandler), {
      authorizer: auth,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    
    const urlComponents = api.url.replace(/^https?:\/\//, '').split("/");
    new CfnOutput(this, "EndPointUri", {
      value: urlComponents[0]
    })
    new CfnOutput(this, "Stage", {
      value: urlComponents[1]
    })
  }
}

