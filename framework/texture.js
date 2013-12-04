function TextureManager() {
}

TextureManager.prototype = {
    load: function(libNames, callback) {
        libNames.forEach(function(libName){
            gResourceMgr.add('texture', libName + '.png');
            gResourceMgr.add('texture', libName + '.json');
        });
        gResourceMgr.load(callback);
    },

    createMovieClip: function(libName, linkName, name){
        name = name || linkName;

        var mcTexture = gResourceMgr.get('texture', libName + '.png');
        var mcConf = gResourceMgr.get('texture', libName + '.json');

        if( !mcTexture || !mcConf || !mcConf[linkName] ) {
            trace('createMovieClip cant find: %s.%s'.format(libName, linkName));
            return null;
        }
        
        var mc = this._createMovieClip(mcConf[linkName], mcTexture);
        mc.name = name;

        return mc;
    },

    _createMovieClip: function(mcConf, mcTexture) {
        if( !mcConf.fs ) {
            return this._createLeafMovieClip(mcConf, mcTexture);
        }

        var mcObj = new MovieClip(mcConf.id, mcConf.fn);
        mcObj.x = mcConf.x;
        mcObj.y = mcConf.y;

        for( var i=1,max=mcConf.fn; i<=max; i++ ) {
            var frame = mcConf.fs[i-1];
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
                } else if( !child.fs ) {
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
            
            var bitmap = new Bitmap(mcTexture, "", frameInfo[2], frameInfo[3], frameInfo[4], frameInfo[5]);
            bitmap.x = frameInfo[0];
            bitmap.y = frameInfo[1];

            mcObj.addChild(bitmap);
            mcObj.nextFrame();
        }

        return mcObj;
    },
};

var gTextureMgr = new TextureManager();
