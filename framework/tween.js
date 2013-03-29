
function TweenChange(obj, property, to) {
    this.obj = obj;
    this.property = property;
    this.from = this.obj[this.property];
    this.to = to || 0;
}

function Tween(type, duration, delay) {
    this.method = Tween.transitions[type || Tween.LINER];
    this.duration = duration || 1.0;
    this.delay = delay || 0.0;
    this.passed = 0;
    this.next = null;
    this.state = Tween.TweenStateDelaying;
    this.changes = [];
}

Tween.prototype = {
    seqMove: function(obj, type, duration, x, y, delay) {
        var tween = Tween.move(obj, type, duration, x, y, delay);
        tween.state = Tween.TweenStateWaiting;
        this.next = tween;

        return tween;
    },

    seqScale: function(obj, type, duration, sx, sy, delay) {
        var tween = Tween.scale(obj, type, duration, sx, sy, delay);
        tween.state = Tween.TweenStateWaiting;
        this.next = tween;

        return tween;
    },

    seqRotate: function(obj, type, duration, rotation, delay) {
        var tween = Tween.rotate(obj, type, duration, rotation, delay);
        tween.state = Tween.TweenStateWaiting;
        this.next = tween;

        return tween;
    },
};

Tween.transitions = {
    liner:function(time, changeValue, duration) {
        return changeValue * time / duration;
    },
    backEaseIn:function(t, c, d) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s);
    },
    backEaseOut:function(t, c, d) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1);
    },
    backEaseInOut:function(t, c, d) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },
    bounceEaseOut:function(t, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t);
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
        }
    },
    bounceEaseIn:function(t, c, d) {
        return c - transitions.bounceEaseOut(d - t, 0, c, d);
    },
    bounceEaseInOut:function(t, c, d) {
        if (t < d / 2) {
            return transitions.bounceEaseIn(t * 2, 0, c, d) * 0.5;
        } else {
            return transitions.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5;
        }
    },
    regularEaseIn:function(t, c, d) {
        return c * (t /= d) * t;
    },
    regularEaseOut:function(t, c, d) {
        return -c * (t /= d) * (t - 2);
    },
    regularEaseInOut:function(t, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t;
        }
        return-c / 2 * ((--t) * (t - 2) - 1);
    },
    strongEaseIn:function(t, c, d) {
        return c * (t /= d) * t * t * t * t;
    },
    strongEaseOut:function(t, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1);
    },
    strongEaseInOut:function(t, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2);
    },
};

Tween.tweens = [];
Tween.update = function(passed) {
    for( var i=Tween.tweens.length-1; i>= 0; i-- ) {
        var tween = Tween.tweens[i];
        if( tween.state == Tween.TweenStateWaiting ) {
            continue;
        }

        tween.passed += passed;
        if( tween.state == Tween.TweenStateDelaying ) {
            if( tween.passed >= tween.delay ) {
                tween.state = Tween.TweenStateWorking;
                tween.passed = 0;
            }
        }else {
            if( tween.passed > tween.duration ) {
                for( var j=0,max=tween.changes.length; j<max; j++ ) {
                    var change = tween.changes[j];            
                    change.obj[change.property] = change.to;
                }
                if( tween.next ) {
                    tween.next.state = Tween.TweenStateDelaying;
                    for( var j=0,max=tween.next.changes.length; j<max; j++ ) {
                        var change = tween.next.changes[j];            
                        change.from = change.obj[change.property];
                    }
                }
                Tween.tweens.splice(i, 1);
            }else {
                for( var j=0,max=tween.changes.length; j<max; j++ ) {
                    var change = tween.changes[j];            
                    var delta = tween.method(tween.passed, change.to - change.from, tween.duration);
                    change.obj[change.property] = change.from + delta;
                }
            }
        }

    }
};

Tween.move = function(obj, type, duration, x, y, delay) {
    if( !obj || !type ) return;

    duration = duration || 0;
    delay = delay || 0;

    var tween = new Tween(type, duration, delay);
    tween.changes.push(new TweenChange(obj, "x", x));
    tween.changes.push(new TweenChange(obj, "y", y));

    Tween.tweens.push(tween);

    return tween;
};

Tween.scale = function(obj, type, duration, sx, sy, delay) {
    if( !obj || !type ) return;

    duration = duration || 0;
    delay = delay || 0;

    tween.changes.push(new TweenChange(obj, "sx", sx));
    tween.changes.push(new TweenChange(obj, "sy", sy));

    var tween = new Tween(type, duration, delay);
    tween.changes = changes;

    Tween.tweens.push(tween);

    return tween;
};

Tween.rotate = function(obj, type, duration, rotation, delay) {
    if( !obj || !type ) return;

    duration = duration || 0;
    delay = delay || 0;

    var tween = new Tween(type, duration, delay);
    tween.changes.push(new TweenChange(obj, "rotation", rotation));

    Tween.tweens.push(tween);

    return tween;
};

Tween.TweenStateWaiting = "waiting";
Tween.TweenStateDelaying = "delaying";
Tween.TweenStateWorking = "working";

Tween.LINER = 'liner';
Tween.BACK_EASE_IN = 'backEaseIn';
Tween.BACK_EASE_OUT = 'backEaseOut';
Tween.BACK_EASE_IN_OUT = 'backEaseInOut';
Tween.BOUNCE_EASE_OUT = 'bounceEaseOut';
Tween.BOUNCE_EASE_IN = 'bounceEaseIn';
Tween.BOUNCE_EASE_IN_OUT = 'bounceEaseInOut';
Tween.STRONG_EASE_IN_OUT = 'strongEaseInOut';
Tween.REGULAR_EASE_IN = 'regularEaseIn';
Tween.REGULAR_EASE_OUT = 'regularEaseOut';
Tween.REGULAR_EASE_IN_OUT = 'regularEaseInOut';
Tween.STRONG_EASE_IN = 'strongEaseIn';
Tween.STRONG_EASE_OUT = 'strongEaseOut';
Tween.STRONG_EASE_IN_OUT = 'strongEaseInOut';
