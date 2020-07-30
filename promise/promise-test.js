const {APromise} = require("./promise-core.js");

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
