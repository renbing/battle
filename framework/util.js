
Function.prototype.bind = function() {
    var fn = this, 
        args = Array.prototype.slice.call(arguments), 
        object = args.shift();

    return function() {
        return fn.apply(object,
                args.concat(Array.prototype.slice.call(arguments)));
    };
};


function extend(Child, Parent) {
    var childPrototype = Child.prototype;
    Child.prototype = new Parent();
    for( var key in childPrototype ) {
        Child.prototype[key] = childPrototype[key];
    }
    Child.prototype.constructor = Child;
}
