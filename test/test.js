let { deferred, rejected, resolved } = require("../promise/promise-interface.js");
var dummy = { dummy: "dummy" }; // we fulfill or reject with this when we don't intend to test against it
var sentinel = { sentinel: "sentinel" }; // a sentinel fulfillment value to test for with strict equality
var other = { other: "other" }; // a value we don't want to be strict equal to

function outer (value) {
    return resolved(value);
}

function inner (value) {
    return {
        then: function (onFulfilled) {
            onFulfilled(value);
        }
    };
}

function yFactory() {
    return outer(inner(sentinel));
}

function xFactory() {
    return {
        then: function (resolvePromise) {
            resolvePromise(yFactory());
        }
    };
}

var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
    return xFactory();
});

promise.then(function(value){
    console.log(value);
})
