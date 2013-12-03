<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>Giraffe</title>
<?php
    $jss = array();

    function findJS($path){
        global $jss;
        $jsDir = dir($path);
        while($file = $jsDir->read()){
            if( $file == "." || $file == ".." ) {
                continue;
            }

            $file = "$path/$file";

            if( is_dir($file) ) {
                findJS($file);
            }else if( pathinfo($file, PATHINFO_EXTENSION) == "js" ) {
                $jss[] = $file;
            }
        }
    }
    findJS('web');
    $webJS = count($jss);
    findJS('framework');
    findJS('model');
    findJS('view');
    findJS('control');

    file_put_contents("index.js", join("\n", array_slice($jss, $webJS)));

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
        var Device = {
            width : <?= $width ?>,
            height : <?= $height ?>,
            name : 'webgl'
        };
    </script>
</head>
<body style="margin-left:20px" onload="webGLStart()">
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
