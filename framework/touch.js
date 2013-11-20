
var Touch = {
    init : function() {
        canvas.addEventListener("mousedown", handleMouseDown, true);
        canvas.addEventListener("mousemove", handleMouseMove, true);
        canvas.addEventListener("mouseup", handleMouseUp, true);
        canvas.addEventListener("mouseout", handleMouseOut, true);
        canvas.addEventListener("mousewheel", handleMouseWheel, true);

        var touch = {};

        function getTouchPoint(e) {
            return {x:e.offsetX || (e.pageX-canvas.offsetLeft), y:e.offsetY || (e.pageY-canvas.offsetTop)};
        }

        function handleMouseDown(e) {
            var point = getTouchPoint(e);

            touch.moved = false;
            touch.enterObject = null;

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
            var point = getTouchPoint(e);
            var now = +(new Date());
            
            if( touch.enterObject ) {
                var offset = {x:point.x - touch.lastPoint.x, y:point.y - touch.lastPoint.y};
                var distance = (Math.abs(offset.x) < Math.abs(offset.y)) ? 
                                Math.abs(offset.y) : Math.abs(offset.x);
                var delay = now - touch.lastTime;
                if( distance > 30 && delay < 20 ) {
                    var direction = (Math.abs(offset.x) < Math.abs(offset.y)) ?
                        ((offset.y < 0) ? Event.SWIPE_UP : Event.SWIPE_DOWN) :
                        ((offset.x < 0) ? Event.SWIPE_LEFT : Event.SWIPE_RIGHT);
                    touch.swipe = direction;
                }

                if( !touch.drag ) {
                    touch.drag = true;
                    touch.enterObject.bubbleEvent(
                        new Event(Event.DRAG_START, touch.enterPoint, offset)
                    );
                }
                touch.enterObject.bubbleEvent(
                    new Event(Event.DRAG, touch.enterPoint, offset));
            }

            touch.lastPoint = point;
            touch.lastTime = now;
        }

        function handleMouseUp(e) {
            if( !touch.enterObject ) return;

            var point = getTouchPoint(e);
            var offset = {x:point.x - touch.lastPoint.x, y:point.y - touch.lastPoint.y};
            
            var event = null;
            if( touch.moved ) {
                if( touch.drag ) {
                    event = new Event(Event.DRAG_END, touch.enterPoint, offset);
                }else if( touch.swipe ) {
                    event = new Event(Event.SWIPE, touch.enterPoint, offset, touch.swipe);
                }
            }else {
                var clickOffset = calculateDistance(point, touch.enterPoint);
                if( clickOffset <= 40 ) {
                    event = new Event(Event.TAP, touch.enterPoint);
                }
            }
            //trace(event, touch.enterObject);
            event && touch.enterObject.bubbleEvent(event);

            touch.drag = false;
            touch.swipe = false;
            touch.moved = false;
            touch.enterObject = null;
        }

        function handleMouseOut(e) {
            if( !touch.enterObject ) {
                return;
            }

            handleMouseUp(e);
        }

        function handleMouseWheel(e){
            onPinch( e.wheelDelta > 0 ? 1.2 : 0.8 );
            e.preventDefault();
        }

        function calculateDistance(pointA, pointB) {
            return Math.sqrt(Math.pow(Math.abs(pointA.x - pointB.x), 2) +
                Math.pow(Math.abs(pointA.y - pointB.y), 2));
        }
    },
};
