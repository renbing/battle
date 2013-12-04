/*
    stage           内置对象,全局舞台
    trace           内置对象,输出日志
    gResourceMgr    资源管理器
    gTextureMgr     纹理管理器
    gSoundMgr       声音管理器
*/

var gNetMgr = null; // 网络管理器

function initGlobal()
{
    gNetManager = new NetManager(1);
}
