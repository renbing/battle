function TextureManager() {
}

TextureManager.prototype = {
    load: function(libNames, callback) {
        libNames.forEach(function(libName){
            resourceManager.add('texture/{0}.png'.format(libName), 'image');
            resourceManager.add('texture/{0}.json'.format(libName), 'json');
        });
        resourceManager.load(callback);
    },

    createMovieClip: function(libName, linkName, name){
        name = name || linkName;

        var mcTexture = resourceManager.get('texture/{0}.png'.format(libName));
        var mcConf = resourceManager.get('texture/{0}.json'.format(libName));

        if( !mcTexture || !mcConf || !mcConf[linkName] ) {
            trace('createMovieClip cant find: {0}.{1}'.format(libName, linkName));
            return null;
        }
        
        var mc = this._createMovieClip(mcConf[linkName], mcTexture);
        mc.name = name;

        return mc;
    },

    _createMovieClip: function(mcConf, mcTexture) {
        if( mcConf.fs.length == 0 ) {
            return this._createLeafMovieClip(mcConf, mcTexture);
        }

        var mcObj = new MovieClip(mcConf.id, mcConf.fn);
        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        for( var i=1,max=mcConf.fn; i<=max; i++ ) {
            var frame = mcConf.frames[i-1];
            for( var j=0,len=frame.length; j<len; j++ ) {
                var child = frame[j];
                var childMC = null;
                if( child.type == "[object TextField]" ) {
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
                } else if( child.fs.length == 0 ) {
                    childMC = this._createLeafMovieClip(child, mcTexture);
                } else {
                    childMC = this._createMovieClip(child, mcTexture);
                }

                mcObj.addChild(childMC);
            }

            mcObj.nextFrame();
        }

        return mcObj;
    },

    _createLeafMovieClip: function(mcConf, mcTexture) {
        var mcObj = new MovieClip(mcConf.id, mcConf.fn);

        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        for( var k=1,maxk=mcConf.fn; k<=maxk; k++ ) {
            var frameInfo = mcConf.fi[k-1];
            
            var bitmap = new Bitmap(mcTexture, imageFile, frameInfo[2], frameInfo[3], frameInfo[4], frameInfo[5]);
            bitmap.x = frameInfo[0];
            bitmap.y = frameInfo[1];

            mcObj.addChild(bitmap);
            mcObj.nextFrame();
        }

        return mcObj;
    },
};

var gTextureManager = new TextureManager();
