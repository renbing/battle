
function MainScene() {
    this.view = null;

    this.mapView = null;
    this.uiView = null;

    this.ui = {};

    this.init();
}

MainScene.prototype = {
    init: function(){
        this.view = new MovieClip('main_scene');
        this.mapView = new MovieClip('map');
        this.uiView = new MovieClip('ui');

        this.view.addChild(this.mapView);
        this.view.addChild(this.uiView);

        stage.addChild(this.view);

        this._initUI();
        this._initMap();
    },

    destroy: function(){
        stage.removeChild(this.view);
    },

    updateHud: function(name, value){
        name = name.toLowerCase();
        value = +value || 0;

        var newValue = gModel.base[name] + value;
        if( newValue < 0 ) {
            alert(name + '不足:' + (-value));
            return false;
        }
        
        if( name == 'honor' ) {
            this.ui.left_top.getChildByName('horner_text').texture.setText(newValue);
        }else if( name == 'gold' ) {
            if( gModel.base.gold >= gModel.base.goldmax && value > 0 ) {
                alert('金币满了');
                return false;
            }
            if( newValue > gModel.base.goldmax ) {
                newValue = gModel.base.goldmax;
            }
            var text = '{0}/{0}'.format(newValue ,gModel.base.goldmax);
            this.ui.right_top.getChildByName('gold_text').texture.setText(text);
        }else if( name == 'oil' ) {
            if( gModel.base.oil >= gModel.base.oilmax && value > 0 ) {
                alert('石油满了');
                return false;
            }
            if( newValue > gModel.base.oilmax ) {
                newValue = gModel.base.oilmax;
            }
            var text = newValue + '/' + gModel.base.oilmax;
            this.ui.right_top.getChildByName('oil_text').texture.setText(text);
        }else if( name == 'working' || name == 'worker' ) {
            var text = '{0}/{1}'.format(newValue, gModel.base.worker);
            if( name == 'worker' ) {
                text = '{0}/{1}'.format(gModel.base.working, newValue);
            }
            gModel.base.working + '/' + gModel.base.worker;
            this.ui.middle_top.getChildByName('worker_text').texture.setText(text);
        }else if( name == 'cash' ) {
            this.ui.right_top.getChildByName('cash_text').texture.setText(newValue);
        }else{
            return false;
        }

        gModel.base[name] = newValue;
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

        this.uiView.addChild(leftTop);
        this.uiView.addChild(middleTop);
        this.uiView.addChild(rightTop);
        this.uiView.addChild(leftBottom);
        this.uiView.addChild(rightBottom);

        this.ui.left_top = leftTop;
        this.ui.middle_top = middleTop;
        this.ui.right_top = rightTop;
        this.ui.left_bottom = leftBottom;
        this.ui.right_bottom = rightBottom;
        
        this.updateHud('gold');
        this.updateHud('oil');
        this.updateHud('cash');
        this.updateHud('working');
        this.updateHud('honor');
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
