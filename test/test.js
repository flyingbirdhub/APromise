let {deferred, rejected} = require("../promise/promise-interface.js");

rejected({dummy: "dummy"}).then(undefined, function(){
    console.log("hello");
});

