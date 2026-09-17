const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src/environments');
const targetPath = path.join(targetDir, 'environment.ts');

// Create the folder if it doesn't exist
fs.mkdirSync(targetDir, { recursive: true });

const content = `export const environment = {
  production: ${process.env.NG_BUILD_ENV === 'production'},
  apiUrl: '${process.env.API_URL || 'https://localhost:7204/api'}',
  frontendUrl: '${process.env.FRONTEND_URL || 'https://localhost:4200'}',
  auth: {
    tokenKey: '${process.env.AUTH_TOKEN_KEY || 'auth_token'}',
    userKey: '${process.env.AUTH_USER_KEY || 'user_data'}',
    externalCookieKey: '${process.env.AUTH_EXTERNAL_COOKIE_KEY || 'ExternalCookie'}',
    testCookieKey: '${process.env.AUTH_TEST_COOKIE_KEY || 'TestCookie'}',
  }
};
`;

fs.writeFileSync(targetPath, content);
console.log(`✔ environment.ts generated at ${targetPath}`);
