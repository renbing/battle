
function RenderContextGL2(width, height) {
    this.width = width;
    this.height = height;

    this.programs = {};
    this.matrixStack = new Matrix4x4Stack();
    this.matrixStack.push();
    this.alphaStack = new AlphaStack();
    this.alphaStack.push();

    this.pMatrix = new Matrix4x4();
    this.pMatrix.ortho(0, gl.viewportWidth, 0, gl.viewportHeight, -1, 1);
    this.mvMatrix = this.matrixStack.top();

    this.glv = [0, gl.viewportHeight];
    this.glmMatrix = new Matrix4x4();
    this.glmMatrix.scale(1.0, -1.0, 1.0);

    this.initPrograms();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

RenderContextGL2.prototype = {
    initPrograms: function() {
        function getShader(id) {
            var shaderScript = document.getElementById(id);
            if( !shaderScript ) {
                trace("can't find shader " + id);
                return null;
            }

            var shaderSource = "";
            var k = shaderScript.firstChild;
            while(k) {
                if( k.nodeType == 3 ) {
                    shaderSource += k.textContent;
                }
                k = k.nextSibling;
            }

            var shader;
            if( shaderScript.type == "x-shader/x-fragment" ) {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            }else if( shaderScript.type == "x-shader/x-vertex" ) {
                shader = gl.createShader(gl.VERTEX_SHADER);
            }else {
                trace("invalid shader type " + shaderScript.type);
                return null;
            }

            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);

            if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
                trace("shader compile fail: " + gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }

        function initFillShaders() {
            var fragmentShader = getShader("shader-fs");
            var vertexShader = getShader("shader-vs");

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) ) {
                trace("link program fail");
                return;
            }

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

            return shaderProgram;
        }

        function initTextureShaders() {
            var fragmentShader = getShader("shader-tfs");
            var vertexShader = getShader("shader-tvs");

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) ) {
                trace("link program fail");
                return;
            }

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
            shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
            gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.sampleUniform = gl.getUniformLocation(shaderProgram, "uSampler");
            shaderProgram.glmUniform = gl.getUniformLocation(shaderProgram, "uGLMMatrix");
            shaderProgram.glvUniform = gl.getUniformLocation(shaderProgram, "aGLVPosition");

            return shaderProgram;
        }

        this.programs['texture'] = initTextureShaders();
        this.programs['fill'] = initFillShaders();

    },

    swithProgram: function(program) {
        var shaderProgram = this.programs[program];
        gl.useProgram(shaderProgram);

        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix.elements);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix.elements);

        if( program == "texture" ) {
            gl.uniform2fv(shaderProgram.glvUniform, this.glv);
            gl.uniformMatrix4fv(shaderProgram.glmUniform, false, this.glmMatrix.elements);
        }

        return shaderProgram;
    },

    save: function() {
        this.matrixStack.push();
        this.alphaStack.push();

        this.mvMatrix = this.matrixStack.top();
    },

    restore: function() {
        this.matrixStack.pop();
        this.alphaStack.pop();

        this.mvMatrix = this.matrixStack.top();
    },

    translate: function(x, y) {
        this.mvMatrix.translate(x, y, 0);
    },

    scale: function(sx, sy) {
        this.mvMatrix.scale(sx, sy, 0);
    },

    rotate: function(angle) {
        this.mvMatrix.rotate(angle, 0, 0, 1);
    },

    scissor: function(rect) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(rect.x, rect.y, rect.w, rect.h);
    },

    unscissor: function() {
        gl.disable(gl.SCISSOR_TEST);
    },

    changeAlpha: function(alpha) {
        this.alphaStack[this.alphaStack.length-1] = this.alphaStack.top() * alpha;
    },

    fillRect: function() {
    },

    drawRect: function(bitmap) {
        if( !bitmap.image.texture ) {
            return;
        }
        var shaderProgram = this.swithProgram("texture");

        gl.bindBuffer(gl.ARRAY_BUFFER, bitmap.vbo);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, bitmap.vbo.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, bitmap.tbo);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, bitmap.tbo.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, bitmap.image.texture);
        gl.uniform1i(shaderProgram.sampleUniform, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, bitmap.vbo.numItems);
    },
};

