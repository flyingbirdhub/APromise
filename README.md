## APromise

Adehun is an implementation of the Promise/A+ spec. 

* promise-es5.js is in ES5 programmer
* promise-core.js is in ES6 programmer, using the ES Module
  * promise-test.js is test suite for promise-core.js
* promise-extension.js provides some functions for promise-core.js
  * Promise-extension-test.js should be the test cases for the extension function.
* promise-util.js provides some function for promise-core.js

### how to test

* npm install
* npm run test, for promise-core.js
* npm run test-es5, for promise-es5.js
* npm run test-ext, for promise-extension.js