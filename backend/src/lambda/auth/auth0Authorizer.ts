import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import * as middy from 'middy';

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJe0S559ZhEbmyMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0xdWhxbnV0YS5ldS5hdXRoMC5jb20wHhcNMjAwMjE2MTIwMTQ5WhcN
MzMxMDI1MTIwMTQ5WjAkMSIwIAYDVQQDExlkZXYtMXVocW51dGEuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7+W4NOrJSgagHPvW
7cxtXK0GRft1wxpdlEG6xTq6KSRPWXVXY3zuEBp6JL5LOatbIIJyyulpIun1LdQQ
Nfic5xcvSOaqrpXsB+qZMsJkitjgNt1/azhEGvrtxSwVhwtFcPXTprvRqCWdB38f
9YwoPNb8L57xmZIDBGJ7z4NdRFxbHJw4TW3B5KG4hRUmDxjBk6z1+DNrHqmpK2An
Z9qaLOFS+V7ZONml7fAYwgjDO6Uqt7LD3m5VbC6wrNf0jTxyJlQ/b2S3U/TVU6OS
K4Qc79yJ9CFTHccDGifsHgozAKKtotMx81bIRXwa5F5x0xGa/qbS3SXFaDgpFYu8
YUpsVwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR8l3xQe6P+
DteHkVtqa7kYLhwIcjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACTZrmaoV1X1nkR7/PtvuG7jIqBGOaFkjMSid6HDMkTy4qCvHPCB/0X6/7Ti2PhR
HU7+dYmyDj7/8nfQanjfI23SYqhMWGsqzqRvXOZWBlTLfPGDOM01dOiuGGU/gjtB
XcuvV8qOLghTJjjb11ye5YrLdd7RcnN+yRaQV3Z6OhDhuzNDoT83gLn1AuqzTVgA
YXWhc/O1OqvYtxS3bMKKhSbo6bRTTnOgnBFKpye9VwKx5rNc6RD8ztAScHiZAR3p
xN8YaXAdomDJR4HZpXcJ5gCy3rT+5PvfaCNZ/pKfF8RFbgr/VulmsjspglDLa6t0
4VaP+Pxcgr4AjEii2yxksGg=
-----END CERTIFICATE-----
`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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
    logger.error('User not authorized', { error: e.message })

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
})


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
