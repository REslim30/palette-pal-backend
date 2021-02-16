import jwt from "express-jwt";
import jwks from "jwks-rsa";
export const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://giahuydo99.au.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://palette-pal-api.com',
  issuer: 'https://giahuydo99.au.auth0.com/',
  algorithms: ['RS256']
});