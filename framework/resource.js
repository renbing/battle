
function LoadProcessor(onAllLoaded, onLoaded) {
    this.loadTotalCount = 0;
    this.loadedCount = 0;

    this.onAllLoaded = onAllLoaded;
    this.onLoaded = onLoaded;

    this.started = false;
}

LoadProcessor.prototype = {

    deliveryPackage: function() {
        this.loadTotalCount ++;
    },

    loadSuccess: function() {
        this.loadedCount += 1; 
        this.onLoaded && this.onLoaded();

        if( this.started ) {
            this.checkAllLoaded();
        }
    },

    getProgressPercent: function() {
        return (this.loadedCount / this.loadTotalCount * 100).toFixed(0);
    },

    start: function() {
        this.started = true;
        this.checkAllLoaded();
    },

    checkAllLoaded: function() {
        if (this.loadedCount >= this.loadTotalCount) {
            this.onAllLoaded && this.onAllLoaded();
        }
    },
};

function ResourceManager() {
    this.pool = {};
    this.args = {};
    this.underLoad = [];
}

ResourceManager.prototype = {
    _getPath : function(folder, file) {
        return folder + "/" + file;
    },

    _getFileType : function(path) {
        if( path.endWith('.json') ) {
            return 'json';
        }else if( path.endWith('.png') || path.endWith('.jpg') ) {
            return 'image';
        }

        return 'text';
    },

    add: function(folder, file, args) {
        var path = this._getPath(folder, file);
        this.underLoad.push(path);
        if( args ) {
            this.args[path] = args;
        }
    },

    remove: function(folder, file) {
        var path = this._getPath(folder, file);
        delete this.pool[path];
        delete this.args[path];
    },

    get: function(folder, file) {
        var path = this._getPath(folder, file);
        var obj = this.pool[path];
        if( !obj ) {
            trace("no resource:" + path);
        }

        return obj;
    },

    load: function(onAllLoad, onLoad) {
        var loadProcessor = new LoadProcessor(onAllLoad, onLoad);
        for( var i=0; i<this.underLoad.length; i++ ) {
            loadProcessor.deliveryPackage(); 
            var path = this.underLoad[i];
            if( this._getFileType(path) == 'image' && this.args[path] == 'mask' ) {
                loadProcessor.deliveryPackage(); 
            }
        }
    
        var pool = this.pool;
        for( var i=0; i<this.underLoad.length; i++ ) {
            var path = this.underLoad[i];
            if( this._getFileType(path) == 'image' ) {
                var isMask = (path in this.args);
                if( isMask && (Device.name == 'webgl') ) {
                    var maskImg = new Image();
                    maskImg._src = path;
                    maskImg.onload = function(){
                        var img = new Image();
                        img.mask = isMask;
                        img.onload = function(){
                            pool[maskImg._src] = gWeb.mergeImageMask(img, maskImg);
                            gWeb.createTexture(pool[maskImg._src]);
                            loadProcessor.loadSuccess();
                        };
                        img.src = maskImg._src.replace('\.png', '\.jpg');
                    };
                    maskImg.src = path.replace('\.png', '_a\.jpg');
                }else{
                    var img = new Image();
                    img.mask = isMask;
                    img._src = path;
                    img.onload = function(){
                        if( Device.name == 'webgl' ) {
                            gWeb.createTexture(img);
                        }
                        pool[img._src] = img;
                        loadProcessor.loadSuccess();
                    };
                    img.src = path;
                }
            }else{
                File.readFile(path, function(err, data, _path){
                    if( err ) {
                        trace('readFile '+_path + ' fail');
                    }else{
                        if( _path.endWith('.json') ) {
                            try{
                                data = JSON.parse(data);
                            }catch(e){
                                data = null;
                                trace('paseJSON '+_path + 'fail');
                            }
                        }
                        pool[_path] = data;
                        loadProcessor.loadSuccess();
                    }
                });
            }
        }
        this.underLoad = [];

        loadProcessor.start();
    },
};

var gResourceMgr = new ResourceManager();
