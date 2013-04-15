
function MainScene() {
    this.view = null;

    this.mapView = null;
    this.world = null;
    this.uiView = null;
    this.logicMap = new LogicMap(World.unitW, World.unitH);

    this.ui = {};

    this.dragBounds = {};
    this.scale = 0.5;
    this.maxScale = 1;
    this.minScale = 0.5;

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

        this.onScale(this.scale);
    },

    destroy: function(){
        stage.removeChild(this.view);
    },

    updateHud: function(name, value){
        name = name.toLowerCase();
        value = +value || 0;

        var newValue = gModel.base[name] + value;
        if( newValue < 0 ) {
            trace(name + '不足:' + (-value));
            return false;
        }
        
        if( name == 'honor' ) {
            this.ui.left_top.getChildByName('horner_text').texture.setText(newValue);
        }else if( name == 'gold' ) {
            if( gModel.base.gold >= gModel.base.goldmax && value > 0 ) {
                trace('金币满了');
                return false;
            }
            if( newValue > gModel.base.goldmax ) {
                newValue = gModel.base.goldmax;
            }
            var text = '{0}/{1}'.format(newValue, gModel.base.goldmax);
            this.ui.right_top.getChildByName('gold_text').texture.setText(text);
        }else if( name == 'oil' ) {
            if( gModel.base.oil >= gModel.base.oilmax && value > 0 ) {
                trace('石油满了');
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
        return true;
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
        this.mapView.x = Device.width/2;
        this.mapView.y = Device.height/2;

        var bg = textureManager.createMovieClip('building', 'bg');
        bg.scaleX = bg.scaleY = 2.5;

        var bgBitmap = bg.getChildAt(0).getChildAt(0);
        this.minScale = Math.max(Device.width / (bgBitmap.width * bg.scaleX),
                Device.height / (bgBitmap.height * bg.scaleY));

        this.mapView.addChild(bg);

        this.mapView.addEventListener(Event.TAP, function(e){
            gActionWindow.close();
        });
        
        this.mapView.addEventListener(Event.DRAG, function(e){
            var nx = this.mapView.x + e.move.x;
            var ny = this.mapView.y + e.move.y;

            if( nx > this.dragBounds.maxX ) {
                nx = this.dragBounds.maxX;
            }
            if( nx < this.dragBounds.minX ) {
                nx = this.dragBounds.minX;
            }
            if( ny > this.dragBounds.maxY ) {
                ny = this.dragBounds.maxY;
            }
            if( ny < this.dragBounds.minY ) {
                ny = this.dragBounds.minY;
            }
            this.mapView.x = nx;
            this.mapView.y = ny;
        }.bind(this));


        this.world = new World();
        this.mapView.addChild(this.world.view);

        for( var corner in gModel.map ) {
            var building = new Building(corner, gModel.map[corner]);
            this.world.add(building);
        }

        gModel.updateBuildingStatistic();
    },

    onPinch: function(scale){
        this.scale *= scale;
        if( this.scale >= this.maxScale ) {
            this.scale = this.maxScale;
        }else if( this.scale <= this.minScale ) {
            this.scale = this.minScale;
        }

        this.onScale(this.scale);
    },

    onScale: function(scale) {
        this.mapView.scaleX = this.mapView.scaleY = scale;

        var bg = this.mapView.getChildByName('bg');
        var scale = bg.scaleX * this.mapView.scaleX;

        var bgBitmap = bg.getChildAt(0).getChildAt(0);
        this.dragBounds = {
            minX: Device.width - bgBitmap.width*scale/2,
            maxX: bgBitmap.width*scale/2,
            minY: Device.height - bgBitmap.height*scale/2,
            maxY: bgBitmap.height*scale/2
        };

        if( this.dragBounds.minX > this.mapView.x ) {
            this.mapView.x = this.dragBounds.minX;
        }else if( this.dragBounds.maxX < this.mapView.x ) {
            this.mapView.x = this.dragBounds.maxX;
        }

        if( this.dragBounds.minY > this.mapView.y ) {
            this.mapView.y = this.dragBounds.minY;
        }else if( this.dragBounds.maxY < this.mapView.y ) {
            this.mapView.y = this.dragBounds.maxY;
        }
    },

    gotoShop: function(){
        trace('gotoShop');
    },

    gotoBattle: function(){
        trace('gotoBattle');
    },

    buyBuilding: function(id){
        if( !(id in gConfBuilding) ) {
            return;
        }

        var buildingConf = gConfBuilding[id][1];
        
        var data = {
            id: id,
            level: 1,
            state: 0,
            timer: 0
        };

        if( id == 'laboratory' ) {
            data.research = 0;
        }else if( id == 'barrack' ) {
            data.task = [];
        }

        var building = new Building(0, data);
        gModel.mapAdd(building);
        this.world.add(building);
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
