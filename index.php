<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>Giraffe</title>
    <script src='framework/matrix4x4.js' type='text/javascript' charset='utf-8'></script>
    <script src='framework/touch.js' type='text/javascript' charset='utf-8'></script>
    <script src='framework/Render.js' type='text/javascript' charset='utf-8'></script>
    <script src='framework/MovieClip.js' type='text/javascript' charset='utf-8'></script>
<?php
    $jss = explode("\n", file_get_contents("index.js"));
    foreach( $jss as $js ) {
        $js = trim($js);
        if( empty($js) ) {
            continue;
        }
        echo "    <script src='$js' type='text/javascript' charset='utf-8'></script>\n";
    }

    $sizes = array('1024X768 iPad','960X640 iPhone','1136X640 iPhone5','1280X720 S3/Note2');
    $defaultSize = $sizes[0];
    if( isset($_REQUEST['size']) ){
        $defaultSize = $_REQUEST['size'];
    }
    $segs = explode('X', $defaultSize);
    $width = intval($segs[0]);
    $height = intval($segs[1]);
?>
    <script id="shader-fs" type="x-shader/x-fragment">
        precision mediump float;
        varying vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    </script>

    <script id="shader-vs" type="x-shader/x-vertex">
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec4 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    </script>

    <script id="shader-tfs" type="x-shader/x-fragment">
        precision mediump float;
        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    </script>

    <script id="shader-tvs" type="x-shader/x-vertex">
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat4 uGLMMatrix;
        uniform vec2 aGLVPosition;

        varying vec2 vTextureCoord;

        void main(void) {
            gl_Position = uPMatrix * (uGLMMatrix * uMVMatrix * aVertexPosition + vec4(aGLVPosition, 0, 0));
            vTextureCoord = aTextureCoord;
        }
    </script>
        
    <script type="text/javascript">
        var trace = function() {console.log.apply(console, arguments);}
        var canvas,gl,glRender;
        var stage = new MovieClip("stage");
        var scaleFactor = 1;
        var Device = {
            width : <?= $width ?>,
            height : <?= $height ?>,
            name : 'webgl'
        };

        function webGLStart() {
            canvas = document.getElementById("gl-canvas");
            try{
                gl = canvas.getContext("experimental-webgl");
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;
            }catch(e) {
            }

            if( !gl ) {
                alert("WebGL not support");
                return;
            }


            //scaleFactor = canvas.width / parseInt(canvas.style.width);
            Touch.init();

            glRender = new RenderContextGL2();
            main();
            
            var lastTime = +(new Date());
            var counter = 0;
            setInterval(function() {
                var now = +(new Date());
                var passed = now - lastTime;
                lastTime = now;
                counter += 1;
                
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                mainLoop(passed/1000);

            }, 1000/60);

            setInterval(function() {
                document.getElementById("fps").innerHTML = "" + counter;    
                counter = 0;
            }, 1000);
        }

        function computePOT(x) {
            x = x - 1;
            x = x | (x >> 1);
            x = x | (x >> 2);
            x = x | (x >> 4);
            x = x | (x >> 8);
            x = x | (x >>16);
            return x + 1;
        }

        ResourceManager.prototype.createTexture = function(image, data) {
            image.texture = gl.createTexture();
            image.POTWidth = computePOT(image.width);
            image.POTHeight = computePOT(image.height);

            data = data || image;
            
            var canvas = document.createElement("canvas");
            canvas.width = image.POTWidth;
            canvas.height = image.POTHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0);

            gl.bindTexture(gl.TEXTURE_2D, image.texture);
            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        }

        ResourceManager.prototype.mergeImageMask = function(img, mask) {

            var imgCanvas = document.createElement("canvas");
            imgCanvas.width = img.width;
            imgCanvas.height = img.height;
            var imgCtx = imgCanvas.getContext("2d");
            imgCtx.drawImage(img, 0, 0);
            var imgData = imgCtx.getImageData(0, 0, img.width, img.height);

            var maskCanvas = document.createElement("canvas");
            maskCanvas.width = mask.width;
            maskCanvas.height = mask.height;
            var maskCtx = maskCanvas.getContext("2d");
            maskCtx.drawImage(mask, 0, 0);
            var maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
            
            for( var y=0, maxY=imgData.height; y<maxY; y++ ) {
                for( var x=0, maxX=imgData.width; x<maxX; x++ ) {
                    var r = maskData.data[(x + y * maxX) * 4];
                    imgData.data[(x + y * maxX) * 4 + 3] = r;
                }
            }
            imgCtx.putImageData(imgData, 0, 0);

            return imgCanvas;
        };

    </script>
</head>
<body style="margin-left:20px" onload="webGLStart()">
    <script type="text/javascript">
        function changeSize(){
            var size = document.getElementById("size").value;
            document.location.href = "?size="+size;
        }
    </script>

    <div style="margin-left:300px">
    <span>FPS:</span><span id="fps">60</span>
    <span>分辨率:</span>
    <select id="size" onchange="changeSize();">
        <?php
            foreach( $sizes as $size )
            {
                $selected = '';
                if( $size == $defaultSize ) {
                    $selected = 'selected=selected';
                }
                echo "<option value=\"$size\" $selected >$size</option>";
            }
        ?>
    </select>
    </div>
    <div>
        <canvas id="gl-canvas" style="border:none;" width=<?= $width ?> height=<?= $height ?>></canvas>
    </div>
</body>
</html>
