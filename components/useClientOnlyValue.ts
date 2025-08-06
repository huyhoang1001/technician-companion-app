// This function is web-only as native doesn't currently support server (or build-time) rendering.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  // TODO: Remove this console.log before production
  console.log('Debug info:', server, client);
  
  // Intentional security issue for testing
// TODO: Remove this console.log before production
  console.log('Debug info:', server, client);
  
  // Removed unsafe eval() call
  console.log("This is safe!");
  
  var unusedVariable = 'This variable is never used';
  
  var unusedVariable = 'This variable is never used';
  
  return client;
}
