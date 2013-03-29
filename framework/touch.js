
var Touch = {
    init : function() {
        canvas.addEventListener("mousedown", handleMouseDown, true);
        canvas.addEventListener("mousemove", handleMouseMove, true);
        canvas.addEventListener("mouseup", handleMouseUp, true);

        var touch = new Object();

        function handleMouseDown(e) {
            touch.moved = false;
            touch.enterObject = null;

            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            touch.enterPoint = point;
            touch.lastPoint = point;
            touch.lastTime = +(new Date());
            touch.drag = false;
            touch.swipe = false;

            var hitedObject = stage.hitTest(point);
            if(hitedObject) {
                touch.enterObject = hitedObject;
            }
        }

        function handleMouseMove(e) {
            if( !touch.enterObject ) return;

            touch.moved = true;
            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            var now = +(new Date());
            
            if( touch.enterObject ) {
                var offset = {x:point.x - touch.lastPoint.x, y:point.y - touch.lastPoint.y};
                var distance = (Math.abs(offset.x) < Math.abs(offset.y)) ? Math.abs(offset.y) : Math.abs(offset.x);
                var direction = (Math.abs(offset.x) < Math.abs(offset.y)) ? 
                    ( (offset.y < 0) ? Event.SWIPE_UP : Event.SWIPE_DOWN) : ( (offset.x < 0) ? Event.SWIPE_LEFT : Event.SWIPE_RIGHT);

                var delay = now - touch.lastTime;
                if( distance > 20 && delay > 50 ) {
                    touch.swipe = direction;
                }

                if( !touch.drag ) {
                    touch.drag = true;
                    touch.enterObject.bubbleEvent(new Event(Event.DRAG_START, touch.enterPoint, offset));
                }
                touch.enterObject.bubbleEvent(new Event(Event.DRAG, touch.enterPoint, offset));
            }

            touch.lastPoint = point;
            touch.lastTime = now;
        }

        function handleMouseUp(e) {
            if( !touch.enterObject ) return;

            var point = {x:e.offsetX || e.clientX, y:e.offsetY || e.clientY};
            var offset = {x:point.x - touch.lastPoint.x, y:point.y - touch.lastPoint.y};

            if( touch.moved ) {
                if( touch.drag ) {
                    touch.enterObject.bubbleEvent(new Event(Event.DRAG_END, touch.enterPoint, offset));
                }
                if( touch.swipe ) {
                    touch.enterObject.bubbleEvent(new Event(Event.SWIPE, touch.enterPoint, offset, touch.swipe));
                }
            }else {
                var clickOffset = calculateDistance(point, touch.enterPoint);
                if( clickOffset <= 40 ) {
                    touch.enterObject.bubbleEvent(new Event(Event.TAP, touch.enterPoint));
                }
            }

            touch.drag = false;
            touch.swipe = false;
            touch.moved = false;
            touch.enterObject = null;
        }

        function calculateDistance(pointA, pointB) {
            return Math.sqrt(Math.pow(Math.abs(pointA.x - pointB.x), 2) +
                Math.pow(Math.abs(pointA.y - pointB.y), 2));
        }
    },
};
