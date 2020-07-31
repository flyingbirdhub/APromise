const {APromise} = require("./promise-extension.js");

module.exports.resolved = APromise.resolved;
module.exports.rejected = APromise.rejected;

module.exports.deferred = function(){
    let _resolve, _reject;
    let promise = new APromise(function (resolve, reject){
        _resolve = resolve;
        _reject = reject;
    });
    return {
        promise: promise,
        resolve: _resolve,
        reject: _reject
    };
}
