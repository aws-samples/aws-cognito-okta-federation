import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Stack, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface AuthenticatorProps {
    clientId: string,
    clientSecret: string,
    issuerUrl: string,
    appClientCallbackUrl: string,
    userPoolCognitoDomain: string
}

export class Authenticator extends Construct {
    public readonly userpool: cognito.IUserPool;

    constructor(scope: Construct, id: string, props: AuthenticatorProps) {
        super(scope, id);

        this.userpool = new cognito.UserPool(this, 'UserPool');
        const provider = new cognito.UserPoolIdentityProviderOidc(this, 'OidcProvider',{
            clientId: props.clientId,
            clientSecret: props.clientSecret,
            userPool: this.userpool,
            issuerUrl: props.issuerUrl,
            attributeMapping: {
                email: cognito.ProviderAttribute.other('email'),
            }
        });
        const appClient = this.userpool.addClient('AppClient', {
        oAuth: {
            flows: {
            authorizationCodeGrant: true,
            },
            scopes: [ cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL ],
            callbackUrls: [ props.appClientCallbackUrl ]
        },
        });
        appClient.node.addDependency(provider);
        const domain = this.userpool.addDomain('CognitoDomain', {
        cognitoDomain: {
            domainPrefix: props.userPoolCognitoDomain,
        },
        });
        const signInUrl = domain.signInUrl(appClient, {
        redirectUri: props.appClientCallbackUrl,
        });

        const appClientId = appClient.userPoolClientId;

        new CfnOutput(this, "ClientId", {
        value: appClientId
        })
        new CfnOutput(this, "RedirectUri", {
        value: props.appClientCallbackUrl
        })
        new CfnOutput(this, "CognitoLoginUrl", {
        value: `${props.userPoolCognitoDomain}.auth.${Stack.of(this).region}.amazoncognito.com`
        })
    }
}