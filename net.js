
function NetManager(uid){
    this.uid = uid;
}

NetManager.prototype = {
    call: function(mod, act, args, callback) {
        args = args || {};
        var req = 'uid={0}&mod={1}&act={2}&args={3}&seq=1'.format(
                    this.uid, mod, act, JSON.stringify(args));
        Ajax.post(gConfig.net.host, req, function(status, url, xhr){
            if( status == 200 ) {
                callback && callback(JSON.parse(xhr.responseText));
            }else{
                trace('netManager req error:'+status);
            }
        });
    },
};
