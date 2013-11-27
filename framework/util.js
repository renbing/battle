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

String.prototype.firstWordCapitalize = function() {
	return this.replace(/\b(\w)/g,function(m){
		return m.toUpperCase();
	});
}
function Loader(onAllLoad) {
    this.tasks = [];
    this.onAllLoad = onAllLoad;
}

Loader.prototype = {
    addLoad: function (task) {
        this.tasks.push(task);
    },

    onLoad: function (task) {
        var index = this.tasks.indexOf(task);
        if (index >= 0) {
            this.tasks.splice(index, 1);
            if (this.tasks.length == 0) {
                this.onAllLoad && this.onAllLoad();
            }
        }
    },
};