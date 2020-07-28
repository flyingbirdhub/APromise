/**
 * execute the func only once
 */
module.exports.Once = function Once(func){
    let executed = false;
    return function(params){
        if(executed){
            return;
        }
        executed = true;
        if(typeof func === "function"){
            func(params);
        }
    }
}

/**
 * execute the func in the next tick
 */
module.exports.NextTick = function NextTick(func){
    return function(){
        setTimeout(func, 0);
    }
}

module.exports.IsFunction = function IsFunction(func){
    return typeof func === "function";
}

module.exports.IsObject = function IsObject(obj){
    return Object.prototype.toString.call(obj) === "[object Object]";
}
