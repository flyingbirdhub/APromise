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
