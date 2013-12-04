var gModel,gScene;
var gConfGlobal, gConfBuilding, gConfCharacter, gConfTownHall;
var gActionWindow;

function mainLoop(passed) {
    stage.render();
    Tween.update(passed);
    Timer.update(passed);
}

function main() {
    trace('main');
    initGlobal();

    testTexture();
    return;

    var uid = null;
    if( typeof(getUID) == 'function' ) {
        uid = getUID();
    }

    if( !uid ) {
        trace('no valid user id');
        return;
    }

    gNetMgr.call('user','login', {}, function(resp){
        if( resp.data.user == null ) {
            User._id = uid;
            gNetManager.call('user', 'save', {'user':User}, function(resp){
                if( resp.code != 0 ) {
                    trace('user.save error');
                }else{
                	gTextureMgr.load(gConfig.mc, onResourceLoad);
                }
            });
        }else{
            User = resp.data.user;
            gTextureMgr.load(gConfig.mc, onResourceLoad);
        }
    });

    function onResourceLoad() {
        trace('resource loaded');

        resourceManager.add('conf/global.dat');
        resourceManager.add('conf/building.dat');
        resourceManager.add('conf/character.dat');
        resourceManager.add('conf/townhall.dat');

        resourceManager.load(onConfLoad);
    }

    function onConfLoad() {
        // 处理配置文件 
        gConfGlobal = new GlobalCSV('conf/global.dat');
        gConfCharacter = new CommonCSV('conf/character.dat', ['ID', 'Level']);
        gConfBuilding = new CommonCSV('conf/building.dat', ['ID', 'Level']);
        gConfTownHall = new CommonCSV('conf/townhall.dat', ['Level']);

        start();
    }

    function start() {
        trace('start');
        gModel = new Model(User);
        gScene = new MainScene();
        windowManager.init();

        gActionWindow = new ActionWindow();
        soundManager.playBackground('home_music.mp3');
    }
}

// 处理缩放手势
function onPinch(scale){
    gScene && gScene.onPinch && gScene.onPinch(scale);
}

// -----------------------测试用---------------------------

function test() {
    gResourceMgr.add('texture', '7.png');
    gResourceMgr.load(onTestLoad);
}

function onTestLoad() {
    trace('start');
    //soundManager.playBackground('music/home_music.mp3');
    //soundManager.playEffect('music/winwinwin.mp3');
    
    var image = gResourceMgr.get('texture', '7.png');
    var text = new TextField();
    text.text = '在纵横交错\n的溪河上，人们根据自己的爱好和河床的宽度大小和大小12';
    text.height = 256;
    text.width = 256;
    text.render();

    var bitmap = new Bitmap(image, 'bitmap');
    var bitmap2 = new Bitmap(text, 'bitmap2');

    bitmap2.y = 150;
    bitmap.y = 100;
    bitmap.addEventListener(Event.TAP, function(e) {
        trace('bitmap taped');
    });
    stage.addChild(bitmap);
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
    
    Ajax.get('http://192.168.1.127:8090/conf/global.dat', function(status, url, xhr) {
        trace('ajax get finished:' + status);
    });
    */
}

function testTexture() {
    gTextureMgr.load(['ui'], onTestTextureLoad);
}

function onTestTextureLoad() {
    var leftTop = gTextureMgr.createMovieClip('ui', 'left_top');

    var middleTop = gTextureMgr.createMovieClip('ui', 'middle_top');
    middleTop.x = Device.width/2;
    middleTop.getChildByName('shop_btn1').addEventListener(Event.TAP, gotoShop);
    middleTop.getChildByName('shop_btn2').addEventListener(Event.TAP, gotoShop);

    var rightTop = gTextureMgr.createMovieClip('ui', 'right_top');
    rightTop.x = Device.width;
    rightTop.getChildByName('shop_btn').addEventListener(Event.TAP, gotoShop);
    
    var leftBottom = gTextureMgr.createMovieClip('ui', 'left_bottom');
    leftBottom.y = Device.height;

    leftBottom.getChildByName('battle').addEventListener(Event.TAP, gotoBattle);

    var rightBottom = gTextureMgr.createMovieClip('ui', 'right_bottom');
    rightBottom.x = Device.width;
    rightBottom.y = Device.height;
    rightBottom.getChildByName('shop').addEventListener(Event.TAP, gotoShop);

    var uiView = new MovieClip('ui');

    uiView.addChild(leftTop);
    uiView.addChild(middleTop);
    uiView.addChild(rightTop);
    uiView.addChild(leftBottom);
    uiView.addChild(rightBottom);

    stage.addChild(uiView);

    function gotoShop() {
        trace('gotoShop');
    }

    function gotoBattle() {
        trace('gotoBattle');
    }
}
