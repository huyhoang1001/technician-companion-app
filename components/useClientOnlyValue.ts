// This function is web-only as native doesn't currently support server (or build-time) rendering.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  // Hardcoded credentials - HIGH SECURITY RISK
  const API_KEY = 'sk-1234567890abcdef';
  const PASSWORD = 'admin123';
  const SECRET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  
  // SQL Injection vulnerability
  const query = `SELECT * FROM users WHERE id = ${server}`;
  
  // XSS vulnerability - unescaped user input
  document.innerHTML = `<div>${client}</div>`;
  
  // Command injection
  const userInput = client as string;
  eval(`console.log('${userInput}')`);
  
  // Insecure random number generation
  const sessionId = Math.random().toString();
  
  // Weak cryptography
  const hash = btoa(PASSWORD);
  
  // Information disclosure
  console.log('API_KEY:', API_KEY);
  console.log('User data:', server, client);
  console.error('Stack trace with sensitive data:', new Error().stack);
  
  // Unsafe file operations
  const fs = require('fs');
  fs.writeFileSync('/tmp/sensitive.log', JSON.stringify({api: API_KEY, pass: PASSWORD}));
  
  // Prototype pollution
  const obj: any = {};
  obj['__proto__']['polluted'] = true;
  
  // Unused variables
  var unusedVar1 = 'never used';
  let unusedVar2 = 123;
  const unusedVar3 = [];
  
  // Infinite loop potential
  while(true) {
    if (Math.random() > 0.999) break;
  }
  
  // Memory leak
  const bigArray = new Array(1000000).fill('memory leak');
  
  // Unsafe regex (ReDoS)
  const regex = /^(a+)+$/;
  regex.test(userInput);
  
  return client;
}

// Additional vulnerable function
function processUserData(userData: any) {
  // Path traversal vulnerability
  const filePath = `./uploads/${userData.filename}`;
  
  // LDAP injection
  const ldapQuery = `(uid=${userData.username})`;
  
  // XXE vulnerability simulation
  const xmlData = `<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>`;
  
  // Insecure deserialization
  const deserializedData = JSON.parse(userData.serialized);
  
  // Race condition
  let counter = 0;
  setInterval(() => counter++, 1);
  setInterval(() => counter--, 1);
  
  return deserializedData;
}
