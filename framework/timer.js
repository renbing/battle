
function Timer(time, repeat, callback) {
    this.time = time;
    this.passed = 0;
    this.repeat = repeat || false;
    this.callback = callback;
}

Timer.timers = {};
Timer.counter = 1;

Timer.setInterval = function(callback, time) {
    Timer.timers[++Timer.counter] = new Timer(time, true, callback);

    return Timer.counter;
};

Timer.setTimeout = function(callback, time) {
    Timer.timers[++Timer.counter] = new Timer(time, false, callback);
};

Timer.clearInterval = function(id) {
    delete Timer.timers[id];
};

Timer.update = function(passed) {
    var timer;
    var overdues = [];

    for( var id in Timer.timers ) {
        timer = Timer.timers[id]; 
        timer.passed += passed;
        if( timer.passed > timer.time ) {
            timer.callback && timer.callback();
            if( !timer.repeat ) {
                overdues.push(id);
            }

            timer.passed -= timer.time;
        }
    }

    for( var i=0,max=overdues.length; i<max; i++ ) {
        delete Timer.timers[overdues[i]];
    }
};
