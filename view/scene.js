
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
        var leftTop = textureManager.createMovieClip('ui', 'left_top');

        var middleTop = textureManager.createMovieClip('ui', 'middle_top');
        middleTop.x = Device.width/2;
        middleTop.getChildByName('shop_btn1').addEventListener(Event.TAP, this.gotoShop);
        middleTop.getChildByName('shop_btn2').addEventListener(Event.TAP, this.gotoShop);

        var rightTop = textureManager.createMovieClip('ui', 'right_top');
        rightTop.x = Device.width;
        rightTop.getChildByName('shop_btn').addEventListener(Event.TAP, this.gotoShop);
        
        var leftBottom = textureManager.createMovieClip('ui', 'left_bottom');
        leftBottom.y = Device.height;
        leftBottom.getChildByName('battle').addEventListener(Event.TAP, this.gotoBattle);
        leftBottom.getChildByName('battle').addEventListener(Event.TAP, this.gotoBattle);

        var rightBottom = textureManager.createMovieClip('ui', 'right_bottom');
        rightBottom.x = Device.width;
        rightBottom.y = Device.height;
        rightBottom.getChildByName('shop').addEventListener(Event.TAP, this.gotoShop);

        this.ui.addChild(leftTop);
        this.ui.addChild(middleTop);
        this.ui.addChild(rightTop);
        this.ui.addChild(leftBottom);
        this.ui.addChild(rightBottom);
    },

    _initMap: function(){
    },

    gotoShop: function(){
        trace('gotoShop');
    },

    gotoBattle: function(){
        trace('gotoBattle');
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
