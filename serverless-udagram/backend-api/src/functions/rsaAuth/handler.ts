import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../libs/auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJdNQGZ6jb57kqMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1icHkwN2gzbTZ5ZjJxbzd0LnVzLmF1dGgwLmNvbTAeFw0yMjExMTUx
OTU3MDNaFw0zNjA3MjQxOTU3MDNaMCwxKjAoBgNVBAMTIWRldi1icHkwN2gzbTZ5
ZjJxbzd0LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAPxL7JC99gdXcYh2UreIyAhcA7x3MlKAs/FF4Z/TJfpIV0fRXgu1WCzinh2c
ZWh0F3ydWBRJ5gQ+LzqOKYSgtINZKXusse3FooEigvZMV46Lx4JvlDUC2AHyL9xk
Nn10PfBszBa7fW+UkuNoiJup4ikq2VhCDj3v7RzWy6O6w+FCHQ0YdmdKyNWBPxNT
FljMfivoADKH0QastP4ycnMi6hI7FdSv4cJpwQx9VAKi+AfbFsraaZCjfe0LFbFF
7T2DDoXxrKuAJhA4MHYxpcCv2Wmpl2or0heoc8lyew8FIzd3cc2T3bXmCLdbW7/z
8SDpKPnbrcmFY/HKcsqBNUIB3L8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUR+YV4K0oNzdOUm7QBtym5g7gwm4wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAnpxJrPwaP3Shlyx0elSkSBb7D6WG2oUGWa/PhZzKh
QGUG6yzDBGGMGrR4q9m0eBu6YzKA+4g0OzTOt+FJtBD1+RWBza4ctKbtVzY/mTYo
lcetVIvTnesgXoXn3GkhnqKrSvvxkRAdD1y6G+D1PqHXbHUbn1p34iMohs2UzLMB
ZMGYzcFHQ1sXzUY62ME4l9fF4HS2M9a+eRhXiHRmW8JqT9xveGLaQC8DUzePoKFm
mqcM63PXT3+7p/9BP43fkVanvU7O9x2Pt9QWH+Hm87rh44jPXM4dywnILUbqgw1t
GN6orAHkrxxIyPGQ3WzVOqFZJ7E666E2lkhPo/1Ek+MP
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}