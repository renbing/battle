function extend(Child, Parent) {
    var childPrototype = Child.prototype;
    Child.prototype = new Parent();
    for( var key in childPrototype ) {
        Child.prototype[key] = childPrototype[key];
    }
    Child.prototype.constructor = Child;
}

function TextField() {
    this.width = 128;
    this.POTWidth = 128;
    this.height = 128;
    this.POTHeight = 128;
    this.color = 'red';
    this.align = 'center';
    this.font = '24px sans-serif';
    this.text = 'default';

    this.texture = 0;
}

TextField.prototype = {
    render: function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext('2d');
        ctx.font = this.font;
        ctx.textAlign = this.align;
        var dx = 0;
        if( this.align == "center" ) {
            dx = this.width / 2 ; 
        }
        //ctx.fillRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.color;
        var textHeight = parseInt(this.font);
        
        var lineCount = 1;
        var segs = this.text.split('\n');
        for( var i=0; i<segs.length; i++ ) {
            var lines = this._wrapText(ctx, segs[i], this.width);
            for( var j=0; j<lines.length; j++ ) {
                ctx.fillText(lines[j], dx, textHeight*lineCount, this.width);
                lineCount += 1;
            }
        }

        gWeb.createTexture(this, canvas);
    },

    _wrapText : function(ctx, text, maxWidth){
        var len = 0;
        var lastBreak = 0;
        var lines = [];
        for( var i=0; i<text.length; i++ ) {
            var charLen = ctx.measureText(text[i]).width;
            len += charLen;
            if( len > maxWidth ) {
                lines.push(text.substr(lastBreak, i-lastBreak));
                len = charLen;
                lastBreak = i;
            }
        }

        lines.push(text.substr(lastBreak));

        return lines;
    },
};

function DisplayObject() {
    this.name = "";

    this.visible = true;
    this.alpha = 1.0;
    this.touchable = true;

    this.x = 0.0;
    this.y = 0.0;
    this.width = 0.0;
    this.height = 0.0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.rotation = 0;

    this.eventBubbleCallBack = {};

    this.matrix = new Matrix4x4();
    this.clipRect = null;

    this.parent = null;
}

DisplayObject.prototype = {

    setClipRect: function(x, y, w, h) {
        this.clipRect = {'x':x,'y':y,'w':w,'h':h};    
    },

    unsetClipRect: function() {
        this.clipRect = null;
    },

    addEventListener: function(type, callback) {
        // 处理prototype继承问题
        if( !this.hasOwnProperty('eventBubbleCallBack') ) {
            this.eventBubbleCallBack = {};
        }
        this.eventBubbleCallBack[type] = callback;
    },

    removeEventListener: function(type) {
        delete this.eventBubbleCallBack[type];
    },

    removeAllEventListener: function() {
        this.eventBubbleCallBack = {};
    },

    bubbleEvent: function(e) {
        var callback = this.eventBubbleCallBack[e.type];
        if( callback ) {
            callback.call(this, e);
            // 阻止冒泡
            return;
            
            // 只阻止手势冒泡
            if( e.type == Event.DRAG || e.type == Event.SWIPE || 
                e.type == Event.DRAG_START || e.type == Event.DRAG_END ) {

                return;
            }
        }

        this.parent && this.parent.bubbleEvent(e);
    },

    hitTest: function(point) {
        if( !this.touchable || !this.visible || this.scaleX == 0 || this.scaleY == 0 || this.alpha == 0 ) {
            return null;
        }

        var inverseMatrix = this.matrix.inverse();
        var dst = inverseMatrix.transformPoint(point);
        if( dst.x >= 0 && dst.x <= this.width && dst.y >= 0 && dst.y <= this.height ) {
            return this;
        }

        return null;
    }
};

function Bitmap(texture, name, sx, sy, sw, sh, width, height) {
    sx = sx || 0;
    sy = sy || 0;
    sw = sw || texture.width;
    sh = sh || texture.height;

    this.name = name || "";
    this.texture = texture;
    this.width = width || sw;
    this.height = height || sh;

    this.anchorX = 0;
    this.anchorY = 0;

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    
    var vertices = [0, this.height, this.width, this.height, 0, 0, this.width, 0];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vbo.itemSize = 2;
    this.vbo.numItems = 4;

    this.tbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbo);

    var uv = [ sx/this.texture.POTWidth,      (sy+sh)/this.texture.POTHeight,
                (sx+sw)/this.texture.POTWidth, (sy+sh)/this.texture.POTHeight,
                sx/this.texture.POTWidth,      sy/this.texture.POTHeight, 
                (sx+sw)/this.texture.POTWidth, sy/this.texture.POTHeight]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    this.tbo.itemSize = 2;
    this.tbo.numItems = 4;
}

Bitmap.prototype = {
    render: function() {
        if( !this.visible || this.scaleX == 0 || this.scaleY == 0 || this.alpha == 0 ) {
            return;
        }

        glRender.save();
        glRender.translate(this.x, this.y);

        if( this.anchorX > 0 || this.anchorY > 0 ) {
            glRender.translate(this.anchorX * this.width, this.anchorY * this.height);
        }
        if( this.scaleX != 1 || this.scaleY != 1 ) {
            glRender.scale(this.scaleX, this.scaleY);
        }
        if( this.rotation != 0 ) {
            glRender.rotate(this.rotation);
        }
        if( this.alpha != 1.0 ) {
            glRender.changeAlpha(this.alpha);
        }
        if( this.anchorX > 0 || this.anchorY > 0 ) {
            glRender.translate(-this.anchorX * this.width, -this.anchorY * this.height); 
        }

        if( this.clipRect ) {
            glRender.scissor(this.clipRect);
        }

        this.matrix = glRender.mvMatrix.copy();
        glRender.drawRect(this);

        if( this.clipRect ) {
            glRender.unscissor();
        }

        glRender.restore();
    },
};

function MovieClip(name, frameCount) {
    this.name = name || ""; 
    this.totalFrames = frameCount || 1;
    this.currentFrame = 1;
    this.isStoped = true;

    this.frames = [
        null   // 占位符,这样就可以直接使用this.frames[framecursor]
    ];
    for (var i = 1; i <= this.totalFrames; i++) {
        this.frames.push([]);
    }

    this.children = this.frames[this.currentFrame];
}

MovieClip.prototype = {

    // 添加子节点----------------------------------------------
    addChild: function(mc) {
        if(!mc) return false;

        mc.parent && mc.parent.removeChild(mc);
        this.children.push(mc);
        mc.parent = this;

        return true;
    },

    addChildAt: function(mc, addIndex) {
        if(!mc) return false;

        mc.parent && mc.parent.removeChild(mc);
        this.children.splice(addIndex, 0, mc);
        mc.parent = this;

        return true;
    },

    // 获取子节点----------------------------------------------
    getChildren: function(){
        return this.children;
    },

    getChildByName: function(name) {
        for( var i = 0,max=this.children.length; i < max; i++ ) {
            var child = this.children[i];
            if(child.name && (child.name === name)) {
                return child;
            }
        }
        return null;
    },

    getChildAt: function(index) {
        if( index < 0 || index >= this.children.length ) {
            return null;
        }

        return this.children[index];
    },

    // 删除子节点----------------------------------------------
    removeChildByName: function(name) {
        if(!name) return;

        for (var i = 0,max=this.children.length; i < max; i++) {
            var child = this.children[i];
            if(child.name && (child.name === name)) {
                this.children.splice(i, 1);
                return child;
            }
        }

        return null;
    },

    removeChild: function(child) {
        if(!child) return;
        var index = this.children.indexOf(child);
        if(index > -1) {
            this.children.splice(index, 1);
        }
        return null;
    },

    removeChildAt: function(index) {
        if( index >= this.children.length ) return;
        this.children.splice(index, 1);
    },

    removeAllChild: function() {
        this.children.splice(0, this.children.length);
    },


    removeFromParent: function() {
        if(this.parent) {
            this.parent.removeChild(this);
        }
    },

    // 播放控制----------------------------------------------
    stop: function() {
        this.isStoped = true;
    },

    play: function() {
        this.isStoped = false;
    },

    gotoAndStop: function(currentFrame) {
        this._goto(currentFrame);
        this.stop();
    },

    gotoAndPlay: function(currentFrame) {
        this._goto(currentFrame);
        this.play();
    },

    nextFrame: function() {
        this._goto(this.currentFrame + 1);
    },

    prevFrame: function() {
        this._goto(this.currentFrame - 1);
    },


    stopAtHead: function(isRecursive) {
        this.gotoAndStop(1);
        if( !isRecursive ) return;

        for( var n = 0, m = this.children.length; n < m; n++ ) {
            var child = this.children[n];
            if( child instanceof MovieClip ) {
                child.stopAtHead(isRecursive);
            }
        }
    },

    render: function() {
        if( !this.visible || this.scaleX == 0 || this.scaleY == 0 || this.alpha == 0 || this.children.length == 0) {
            return;
        }

        glRender.save();
        glRender.translate(this.x, this.y);

        if( this.scaleX != 1 || this.scaleY != 1 ) {
            glRender.scale(this.scaleX, this.scaleY);
        }
        if( this.rotation != 0 ) {
            glRender.rotate(this.rotation);
        }
        if( this.alpha != 1.0 ) {
            glRender.changeAlpha(this.alpha);
        }

        if( this.clipRect ) {
            glRender.scissor(this.clipRect);
        }

        // 处理ENTER_FRAME事件
        var callback = this.eventBubbleCallBack[Event.ENTER_FRAME];
        if( callback ) {
            callback.call(this);
        }
        
        for( var i=0,max=this.children.length; i<max; i++ ) {
            var child = this.children[i];
            child.render();
        }

        if( this.clipRect ) {
            glRender.unscissor();
        }

        glRender.restore();

        (!this.isStoped) && this.nextFrame();
    },

    hitTest: function(point) {
        if( !this.touchable || !this.visible || this.scaleX == 0 || this.scaleY == 0 || this.alpha == 0 ) {
            return;
        }

        for(var i=this.children.length-1; i>=0; i-- ) {
            var hited = this.children[i].hitTest(point);
            if( hited ) {
                return hited;
            }
        }

        return null;
    },

    // 内部函数-----------------------------------------------
    _goto: function(frame) {
        if(frame < 1) {
            this.currentFrame = this.totalFrames;
        }
        else if(frame > this.totalFrames) {
            this.currentFrame = 1;
        }
        else {
            this.currentFrame = frame;
        }

        this.children = this.frames[this.currentFrame];
    },
};

extend(Bitmap, DisplayObject);
extend(MovieClip, DisplayObject);
