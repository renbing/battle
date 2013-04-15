function TextureManager() {
    this.pool = {};
    this.callback = null;
}

TextureManager.prototype = {
    load: function(libNames, callback) {
        this.callback = callback;
        for( var i=0,max=libNames.length; i<max; i++ ) {
            var libName = libNames[i];
            this.pool[libName] = {};
            resourceManager.add('texture/{0}/{0}.png'.format(libName, libName), 'image');
            resourceManager.add('texture/{0}/{0}.json'.format(libName, libName), 'json');
        }

        resourceManager.load(this._onLibLoad.bind(this));
    },

    createMovieClip: function(libName, linkName, name){
        name = name || linkName;

        if( !this.pool[libName] || !this.pool[libName][linkName] ) {
            trace('createMovieClip cant find: {0}.{1}'.format(libName, linkName));
            return null;
        }
        
        var mcConf = this.pool[libName][linkName].conf;
        var mc = this._createMovieClip(mcConf, '', libName, linkName);
        mc.name = name;

        return mc;
    },

    _createMovieClip: function(mcConf, path, libName, linkName) {
        if( mcConf.frames.length == 0 )
        {
            return this._createLeafMovieClip(mcConf, path, libName, linkName);
        }

        var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);
        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        for( var i=1,max=mcConf.totalFrames; i<=max; i++ )
        {
            var framePath = path + i + "/";

            var frame = mcConf.frames[i-1];
            for( var j=0,len=frame.length; j<len; j++ )
            {
                var child = frame[j];
                var childMC = null;
                if( child.type == "[object TextField]" )
                {
                    var text = new TextField();
                    text.font = child.size+'px sans-serif';
                    text.align = (child.align || "center");
                    //text.color = child.color;
                    text.width = child.width;
                    text.height = child.height;
                    text.render();

                    childMC = new Bitmap(text, child.id);
                    childMC.x = child.x;
                    childMC.y = child.y;
                }
                else if( child.frames.length == 0 )
                {
                    childMC = this._createLeafMovieClip(child, framePath, 
                                                        libName, linkName);
                }
                else
                {
                    childMC = this._createMovieClip(child, 
                            framePath + child.id + "/", libName, linkName);
                }

                mcObj.addChild(childMC);
            }

            mcObj.nextFrame();
        }

        return mcObj;
    },

    _createLeafMovieClip: function(mcConf, path, libName, linkName) {
        var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);

        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        // 获取对应的纹理以及纹理打包配置
        var textureConf = this.pool[libName][linkName].frames;

        // 叶子节点,创建纹理
        for( var k=1,maxk=mcConf.totalFrames; k<=maxk; k++ )
        {
            var frameInfo = mcConf.framesInfo[k-1];
            
            var bSplit = false;
            var frameInfos = [frameInfo];

            for( var i=1,maxi=frameInfos.length; i<=maxi; i++ )
            {
                var frameInfo = frameInfos[i-1];
                var imageFile = mcConf.id + "_" + k + ".png";
                if( bSplit )
                {
                    imageFile = mcConf.id + "_" + k + "_" + i + ".png";
                }

                var textureInfo = textureConf[path+imageFile];
                if( !textureInfo )
                {
                    trace(path+imageFile);
                    continue;
                }

                if( textureInfo.w <= 0 || textureInfo.h <= 0 )
                {
                    continue;
                }

                var img = resourceManager.get('texture/{0}/{0}.png'.format(libName));

                var sx = textureInfo.x;
                var sy = textureInfo.y;
                var sw = textureInfo.w;
                var sh = textureInfo.h;

                var bitmap = new Bitmap(img, imageFile, sx, sy, sw, sh);
                bitmap.x = frameInfo[0] + textureInfo.ox;
                bitmap.y = frameInfo[1] + textureInfo.oy;

                mcObj.addChild(bitmap);
            }

            mcObj.nextFrame();
        }

        return mcObj;
    },

    _onLibLoad: function(){
        for( var libName in this.pool ) {
            var file = 'texture/{0}/{0}.json'.format(libName, libName);
            var packConf = resourceManager.get(file);
            for( var i=0,max=packConf.frames.length; i<max; i++ ) {
                this._parseLib(libName, packConf.frames[i]);
            }
            resourceManager.remove(file);
        }
        this._loadLinks();
    },

    _parseLib: function(libName, frame){
        if( !(libName in this.pool) ) {
            return;
        }

        var links = this.pool[libName];
        var segs = frame.filename.split('/');
        var linkName = segs.shift();
        if( !(linkName in links) ){
            links[linkName] = {frames:{}, conf:null};
        }

        links[linkName].frames[segs.join('/')] = {
            x: frame.frame.x,
            y: frame.frame.y,
            w: frame.frame.w,
            h: frame.frame.h,
            ox:frame.spriteSourceSize.x,
            oy:frame.spriteSourceSize.y,
            r: frame.rotated
        };
    },

    _loadLinks: function() {
        for( var libName in this.pool ) {
            for( var linkName in this.pool[libName] ) {
                var file = 'texture/{0}/{1}.json'.format(libName, linkName);
                resourceManager.add(file, 'json');
            }
        }
        resourceManager.load(this._onLinksLoad.bind(this));
    },

    _onLinksLoad: function() {
        for( var libName in this.pool ) {
            for( var linkName in this.pool[libName] ) {
                var file = 'texture/{0}/{1}.json'.format(libName, linkName);
                this.pool[libName][linkName].conf = resourceManager.get(file);
                resourceManager.remove(file);
            }
        }
        this.callback && this.callback(); 
    }
};

textureManager = new TextureManager();
