var gModel,gScene;

function mainLoop(passed) {
    stage.render();
    Tween.update(passed);
    Timer.update(passed);
}

function main() {
    trace("main");
    textureManager.load(gConfig.mc, onTextureLoad);
    //test();
}

function onTextureLoad() {
    start();
}

function start() {
    trace('start');
    gModel = new Model(User);
    gScene = new MainScene();
}


// -----------------------测试用---------------------------

function test() {
    resourceManager.add("texture/cubetexture.png", "image");
    resourceManager.load(onTestLoad);
}

function onTestLoad() {
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
    var bitmap2 = new Bitmap(text, "bitmap2");
    var bitmap3 = new Bitmap(image, "bitmap3");
    bitmap3.y = 100;
    bitmap3.x = 200;
    bitmap2.y = 150;
    bitmap.y = 100;
    bitmap.addEventListener(Event.TAP, function(e) {
        trace('bitmap taped');
    });
    stage.addChild(bitmap);
    stage.addChild(bitmap3);
    stage.addChild(bitmap2);
    
    Tween.move(bitmap, Tween.BACK_EASE_IN, 3, 300, 100, 1)
        .seqMove(bitmap, Tween.BACK_EASE_IN, 3, 0, 100, 0);

    /*
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
    */
}
