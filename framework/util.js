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

Array.prototype.sum = function() {
    var total = 0;
    for(var i=0; i<this.length; i++) {
        if( !isNaN(this[i]) ) {
            total += +this[i];
        }
    }

    return total;
}

Array.prototype.remove = function(item) {
    var index = this.indexOf(item);

    if( index >= 0){
        this.splice(index, 1);
    }
}

String.prototype.startWith = function(prefix) {
    if( !prefix || !this.length || this[0] != prefix[0] ) return false;
    return (this.substr(0, prefix.length) == prefix);
}

String.prototype.endWith = function(suffix) {
    if( !suffix || !this.length || suffix.length > this.length) return false;
    return (this.substr(this.length - suffix.length) == suffix);
}

String.prototype.format = function() {
    var args = arguments;
    var i = 0;
    return this.replace(/%s/g, function(m){
        return args[i++] || "%s";
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
