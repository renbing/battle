
function mainLoop(passed) {
    stage.render();
    Tween.update(passed);
    Timer.update(passed);
}

function main() {
    trace("main");
    resourceManager.add("texture/cubetexture.png", "image");
    resourceManager.load(start);
}

function start() {
    trace('start');
    soundManager.playBackground("music/home_music.mp3");
    //soundManager.playEffect("music/winwinwin.mp3");
    
    var image = resourceManager.get("texture/cubetexture.png");
    var text = new TextField();
    //text.text = "我们我们我们我们我们我们我们我们我们";
    //text.height = 32;
    text.width = 256;
    //text.height = 256;
    text.render();

    var bitmap = new Bitmap(image, "bitmap");
    //var bitmap = new Bitmap(text, "bitmap");
    bitmap.y = 100;
    bitmap.addEventListener(Event.TAP, function(e) {
        trace('bitmap taped');
    });
    stage.addChild(bitmap);
    
    Tween.move(bitmap, Tween.BACK_EASE_IN, 1, 300, 100, 1)
        .seqMove(bitmap, Tween.BACK_EASE_IN, 1, 0, 100, 0);

    Timer.setTimeout(function(){
        //stage.removeChild(bitmap);
        soundManager.stopBackground();
    }, 10);
    
    Timer.setTimeout(function(){
        soundManager.playBackground();
    }, 15);
    
    Ajax.get("http://192.168.1.127:8090/conf/global.dat", function(status, url, xhr) {
        trace('ajax get finished:' + status);
    });
}
