
function Event(type, point, move, direction, data) {
    this.type = type;
    this.point = point;
    this.move = move;
    this.direction = direction;
    this.data = data;
}

Event.ENTER_FRAME = 1;
Event.TAP = 2;
Event.SWIP = 3;
Event.DRAG_START = 4;
Event.DRAG = 5;
Event.DRAG_END = 6;
Event.SWIPE_LEFT = 7;
Event.SWIPE_RIGHT = 8;
Event.SWIPE_UP = 9;
Event.SWIPE_DOWN = 10;
