/*
Function.prototype.bind = function() {
    var fn = this, 
        args = Array.prototype.slice.call(arguments), 
        object = args.shift();

    return function() {
        return fn.apply(object,
                args.concat(Array.prototype.slice.call(arguments)));
    };
};
*/


function extend(Child, Parent) {
    var childPrototype = Child.prototype;
    Child.prototype = new Parent();
    for( var key in childPrototype ) {
        Child.prototype[key] = childPrototype[key];
    }
    Child.prototype.constructor = Child;
}

String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m,i){
        return args[i];
    });
}

function getTime() {
    return Math.round(+(new Date()) / 1000);
}

function getDate() {
    var now = new Date();
    return now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
}
