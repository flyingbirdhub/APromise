/**
 * provide util function for promise
 */
let Util = Object.create(null);

/**
 * wrap a function, and return a function that can only execute for once
 */
Util.once = function (func){
    let executed = false;
    return function(params){
        if(executed){
            return;
        }
        executed = true;
        Util.isFunction(func) && func(params);
    }
}

/**
 * execute the func in the next tick
 */
Util.nextTick = function (func){
    return function(){
        setTimeout(func, 0);
    }
}

/**
 * check the func if is a real function
 */
Util.isFunction = function (func){
    return typeof func === "function";
}

/**
 * check the obj if is a object, exclude the "null"
 */
Util.isObject = function (obj){
    return Object.prototype.toString.call(obj) === "[object Object]";
}

module.exports.Util = Util;