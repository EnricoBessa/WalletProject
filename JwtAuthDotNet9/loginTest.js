const https = require('https');  
const users = [ {u:'teste', p:'teste'}, {u:'teste@gmail.com', p:'teste'} ];  
const doLogin = (user) = 
  const data = JSON.stringify({ username: user.u, password: user.p });  
  const options = { hostname: 'localhost', port: 5230, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, rejectUnauthorized: false };  
  const req = https.request(options, res = 
    let body = ''; res.on('data', chunk = += chunk); res.on('end', () = 
      console.log('USER', user.u, 'STATUS', res.statusCode, 'BODY', body);  
    });  
  });  
  req.on('error', err =, err.message));  
  req.write(data); req.end();  
};  
users.forEach(doLogin);  
