// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'wtm7513l31'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-1uhqnuta.eu.auth0.com',            // Auth0 domain
  clientId: 'Kq2YUoj6q5sA8zVvPxH1LLydooChV4S1',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
