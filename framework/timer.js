
function Timer(time, repeat, callback) {
    this.time = time;
    this.passed = 0;
    this.repeat = repeat || false;
    this.callback = callback;
}

Timer.timers = {};
Timer.counter = 1;
Timer.ticks = [];

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

Timer.addTick = function(tick){
    Timer.ticks.push(tick);
};

Timer.removeTick = function(tick){
    var index = Timer.ticks.indexOf(tick);
    if( index < 0 ) {
        return;
    }

    Timer.ticks.splice(index, 1);
};

Timer.setInterval(function(){
    for( var i=0,max=Timer.ticks.length; i<max; i++ ) {
        Timer.ticks[i]();
    }
}, 1);

Timer.getTime = function() {
    return Math.round(+(new Date()) / 1000);
}

Timer.getDate = function() {
    var now = new Date();
    return now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
}
