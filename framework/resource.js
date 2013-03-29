
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
        this.loadedCount++; 
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
    this.mask = {};
    this.underLoad = {};
}

ResourceManager.prototype = {

    add: function(path, type, args){
        if( path in this.pool ) {
            return;
        }

        this.underLoad[path] = {"type":type, "data":null, "args":args};
    },

    remove: function(path) {
        delete this.pool[path];
    },

    get: function(path) {
        var obj = this.pool[path];
        if( !obj ) {
            trace("no resource:" + path);
            return null;
        }

        if( obj.type == "image" && obj.args == "masked" ) {
            // PNG -> JPG + mask PNG
            if( path in this.mask ) {
                obj.data = this.mergeImageMask(obj.data, this.mask[path]);
                delete this.mask[path];
            }
        }
        if( obj.type == "image" && !obj.data.hasOwnProperty("texture") ) {
            this.createTexture && this.createTexture(obj.data);            
        }

        return obj.data;
    },

    load: function(onAllLoad, onLoad) {

        var loadProcessor = new LoadProcessor(onAllLoad, onLoad);
        for(var path in this.underLoad) {
            this.pool[path] = this.underLoad[path];
            var type = this.pool[path].type;

            loadProcessor.deliveryPackage(); 
            if(type == "image") {
                var img = new Image();
                img.onload = function() {
                    loadProcessor.loadSuccess();
                };
                this.pool[path].data = img;
                
                if( this.pool[path].args == "masked" ) {
                    img.src = path.replace("\.png", "\.jpg");
                } else {
                    img.src = path;
                }
                
                if( this.pool[path].args == "masked" ) {
                    //加载对应的Mask图
                    loadProcessor.deliveryPackage(); 
                    var maskImg = new Image();
                    maskImg.onload = function(){
                        loadProcessor.loadSuccess();
                    };
                    this.mask[path] = maskImg;
                    maskImg.src = path.replace("\.png", "_a\.png");
                }
            }else{
                Ajax.get(path, function(path, type) {
                        return function(status, url, xhr){
                            if(type == "xml") {
                                pool[path].data = new DOMParser().parseFromString(xhr.responseText, "text/xml");
                            }else if(type == "json") {
                                pool[path].data = eval("(" + xhr.responseText + ")");
                            }else{
                                pool[path].data = xhr.responseText;
                            }
                            loadProcessor.loadSuccess();
                        };
                }(path, type));
            }
        }
        
        loadProcessor.start();
        this.underLoad = {};
    },
};

resourceManager = new ResourceManager();
