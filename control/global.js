// var stage = null; 内置对象,全局舞台
// trace 内置对象,输出日志
var gResourceMgr = null;
var gNetMgr = null;
var gTextureMgr = null;
var gSoundMgr = null;

function initGlobal()
{
    gResourceMgr = new ResourceManager();
    gTextureMgr = new TextureManager();
    gSoundMgr = new SoundManager();

    gNetManager = new NetManager(1);
}
