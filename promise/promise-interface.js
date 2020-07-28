const {_Promise} = require("./promise-core.js");

module.exports.resolved = _Promise.resolved;

module.exports.rejected = _Promise.rejected;

module.exports.deferred = function(resolver){
    let promise = new _Promise(resolver);
    return {
        promise: promise,
        resolve: promise.resolve.bind(promise),
        reject: promise.reject.bind(promise)
    };
}