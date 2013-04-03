
function MainScene() {
    this.view = null;
    this.ui = null;
    this.map = null;

    this.init();
}

MainScene.prototype = {
    init: function(){
        this.view = new MovieClip('main_scene');
        this.map = new MovieClip('map');
        this.ui = new MovieClip('ui');

        this.view.addChild(this.map);
        this.view.addChild(this.ui);

        stage.addChild(this.view);

        this._initUI();
        this._initMap();
    },

    destroy: function(){
        stage.removeChild(this.view);
    },

    updateHud: function(){
        var hud = global.stage.getChildByName("ui").getChildByName("hud");
        name = name.toLowerCase();

        var newValue = this.base[name] + value;
        if( newValue < 0 ) {
            alert(name + "不足:" + (-value));
            return false;
        }

        if( name == "xp" ) {
            var oldLevel = global.csv.level.getLevel(this.base.xp);
            var newLevel = global.csv.level.getLevel(newValue);
            var nextLevelXp = global.csv.level.getXp(newLevel+1);

            hud.getChildAt(1).text = newLevel + " " + newValue + "/" + nextLevelXp;
        }else if( name == "gold" ) {
            if( this.base.gold >= this.base.goldmax && value > 0 ) {
                alert("金币满了");
                return false;
            }
            if( newValue > this.base.goldmax ) {
                newValue = this.base.goldmax;
            }
            hud.getChildAt(3).text = newValue + "/" + this.base.goldmax;
        }else if( name == "oil" ) {
            if( this.base.oil >= this.base.oilmax && value > 0 ) {
                alert("石油满了");
                return false;
            }
            if( newValue > this.base.oilmax ) {
                newValue = this.base.oilmax;
            }
            hud.getChildAt(5).text = newValue + "/" + this.base.oilmax;
        }else if( name == "working" ) {
            hud.getChildAt(7).text = newValue + "/" + this.base.worker;
        }else if( name == "cash" ) {
            hud.getChildAt(9).text = newValue;
        }else if( name == "score" ) {
            hud.getChildAt(11).text = newValue;
        }
    },

    _initUI: function(){
        this.ui.addChild(textureManager.createMovieClip('ui', 'left_top'));

        var middleTop = textureManager.createMovieClip('ui', 'middle_top');
        middleTop.x = Device.width/2;
        this.ui.addChild(middleTop);

        var rightTop = textureManager.createMovieClip('ui', 'right_top');
        rightTop.x = Device.width;
        this.ui.addChild(rightTop);
        
        var leftBottom = textureManager.createMovieClip('ui', 'left_bottom');
        leftBottom.y = Device.height;
        this.ui.addChild(leftBottom);

        var rightBottom = textureManager.createMovieClip('ui', 'right_bottom');
        rightBottom.x = Device.width;
        rightBottom.y = Device.height;
        this.ui.addChild(rightBottom);

    },

    _initMap: function(){
    },
};

function BattleScene() {
}

BattleScene.prototype = {
    init: function(){
    },

    destroy: function(){
    },
};
