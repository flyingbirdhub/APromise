const {_Promise} = require("./promise-core.js");

module.exports.resolved = function(value){
    let promise = new _Promise();
    return promise.resolve(value);
}

module.exports.rejected = function(reason){
    let promise = new _Promise();
    return promise.reject(reason);
}

module.exports.deferred = function(resolver){
    let promise = new _Promise();
    return {
        promise: promise,
        resovle: promise.resovle.bind(promise),
        rejecte: promise.reject.bind(promise)
    };
}