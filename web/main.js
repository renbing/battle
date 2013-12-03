var trace = function() {console.log.apply(console, arguments);}
var gl,glRender,stage;
var gWeb = {};

gWeb.webGLStart = function() {
    stage = new MovieClip("stage");
    var canvas = document.getElementById("gl-canvas");
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

    }, 1000/30);

    setInterval(function() {
        document.getElementById("fps").innerHTML = "" + counter;    
        counter = 0;
    }, 1000);
};

gWeb.createTexture = function(image, data) {
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

};

gWeb.mergeImageMask = function(img, mask) {

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

gWeb.changeSize = function(){
    var size = document.getElementById("size").value;
    document.location.href = "?size="+size;
};

function computePOT(x) {
    x = x - 1;
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >>16);
    return x + 1;
}

function setUID(uid){
    var date = new Date();
    date.setTime(date.getTime()+1000*24*3600*1000);
    document.cookie = "user=%s;expires=%s".format(uid, date.toGMTString());
}

function getUID(){
    var segs = document.cookie.split("="); 
    if( segs.length > 0 ) {
        return parseInt(segs[1]);
    }
    return null;
}

window.onunload = function(){
    gModel.save();
};

window.onbeforeunload = function(){
    gModel.save();   
};
