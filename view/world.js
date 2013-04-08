/**
 * 地图
 */

function LogicMap(w, h) {
    this.data = new Array(w);
    for( var i=0; i<w; i++ ) {
        var row = new Array(h);
        for( var j=0; j<h; j++ ) {
            row[j] = 0;
        }
        this.data[i] = row;
    }
}

LogicMap.prototype = {
    addRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                this.data[x+i][y+j] = 1;
            }
        }
    },

    clearRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                this.data[x+i][y+j] = 0;
            }
        }
    },

    /* 测试一个区域是否与已经存在的碰撞,碰撞返回true,否则false  
     */
    testRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                if( this.data[x+i][y+j] == 1 ) {
                    return true;
                }
            }
        }

        return false;
    },
};

function World() {
    this.view = new MovieClip('world');
    this.view.x = -574*2.5;
    this.view.y = -58*2.5;
}

World.unitX = 72;   // X轴单位格大小
World.unitY = 54;   // Y轴单位格大小
World.unitW = 40;   // 逻辑宽度
World.unitH = 40;   // 逻辑高度

World.prototype = {
    add: function(building){
        this.view.addChild(building.view);
    },
    
};

