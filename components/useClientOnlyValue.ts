// This function is web-only as native doesn't currently support server (or build-time) rendering.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  // TODO: Remove this console.log before production
// Import the sanitize-log package for log sanitization
// sanitizeLog function removes or encodes potentially harmful characters
import { sanitizeLog } from 'sanitize-log';

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  // Sanitize inputs before logging
  console.log('Debug info:', sanitizeLog(server), sanitizeLog(client));
  
  // Remove eval statement for security
  
  // Remove unused variable
  
  return client;
}
  
  // Intentional security issue for testing
  eval('console.log("This is unsafe!")');
  
  var unusedVariable = 'This variable is never used';
  
  return client;
}
