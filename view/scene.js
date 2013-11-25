
function MainScene() {
    this.view = null;

    this.mapView = null;
    this.world = null;
    this.uiView = null;

    this.ui = {};

    this.dragBounds = {};
    this.scale = 0.5;
    this.maxScale = 1;
    this.minScale = 0.5;
    
    this.wallMap = null;

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
        this._initWallMap();

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

        this.mapView.addEventListener(Event.TAP, function(scene){
            return function() {
            	if( gScene.world.isVirtualBuilding(null) ) {
            		gActionWindow.close();
            		var selectBuiding = scene.world.selectBuildings.getSelect();
            		if( selectBuiding ) {
            			selectBuiding.backInPlace();
            		}
                	scene.world.moveArrow.close();
                	scene.world.selectBuildings.clearSelect();
                }
            }
        }(this));
        
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
        
        for( var id in gModel.map ) {
            var building = new Building(id, gModel.map[id]);
            this.world.add(building);
        }

        gModel.updateBuildingStatistic();
        
        // test
        if (gModel.buildingCount['town_hall'] == undefined ||
        		gModel.buildingCount['town_hall'] < 1) {
        	var nextID = gModel.nextId();
    	    var data = {
	            name: 'town_hall',
	            level: 1,
	            state: 0,
	            timer: 0,
	            corner : 0,
	        };
    	    var building = new Building(nextID, data);
    	    gModel.mapAdd(building);
    	    this.world.add(building);
        }

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
        windowManager.open("shop_list_panel");
    },

    gotoBattle: function(){
        trace('gotoBattle');
    },

    buyBuilding: function(building){
    	var name = building.data.name;
        if( !(name in gConfBuilding) ) {
            return false;
        }
        if( building.data.level != 1 ||
    		building.data.state != 0 ||
    		building.data.timer != 0) {
        	trace('buy building error........');
        	return false;
        }
        
        if( !this._checkBuyBuilding(building) ) {
        	return false;
        }

        var buildingConf = gConfBuilding[name][1];
        
        building.id = gModel.nextId();
        
        if( name == 'laboratory' ) {
        	building.data.research = 0;
        }else if( name == 'barrack' ) {
        	building.data.task = [];
        }else if( buildingConf['MaxStoredGold'] ||
        		  buildingConf['MaxStoredOil'] ||
        		  buildingConf['ProducesResource']) {
        	building.data.storage = {};
        }
        
        if (buildingConf['MaxStoredGold']) {
        	building.data.storage['gold'] = 0;
        }
        if (buildingConf['MaxStoredOil']) {
        	building.data.storage['oil'] = 0;
        }
        if (buildingConf['ProducesResource']) {
        	building.data.storage[buildingConf['ProducesResource'].toLowerCase()] = 0;
        }
        
        gModel.mapAdd(building);
        this.world.add(building);
        return true;
    },
    
    _checkBuyBuilding: function(building) {
    	var name = building.data.name;
    	var buildingBaseConf = gConfBuilding[name][1];
    	
    	var resType = buildingBaseConf['BuildResource'];
    	var buildCost = buildingBaseConf['BuildCost'];
    	
    	var needLevel = buildingBaseConf['TownHallLevel'];
    	var townHallLevel = gModel.buildingMaxLevel['town_hall'];
    	var townHallConf = gConfTownHall[townHallLevel];
    	
    	var currentCount = gModel.buildingCount[name];
    	var maxCount = townHallConf[name];
    	
    	var x = building.ux;
    	var y = building.uy;
    	var width = building.size;
    	var height = building.size;
    	
    	// 基地需求等级检测
    	if( townHallLevel < needLevel ) {
    		trace('基地等级不够');
    		return false;
    	}
    	
    	// 建造数量检测
    	if( currentCount >= maxCount ) {
    		trace('超出建造最大数量');
    		return false;
    	}
    	
    	// 阻挡区域检测
    	if( !gScene.world.testBlockingRegion(x, y, width, height) ) {
    		trace('碰撞');
    		return false;
    	}
    	
    	// 花费检测
    	if( gScene.world.changeResources(resType, -buildCost) == false ) {
    		return false;
    	}
    	return true;
    },
    
    _initWallMap: function() {
    	this.wallMap = new WallMap(World.unitW, World.unitH);
    	this.wallMap.updateAll(this.world.items);
    }
};

function BattleScene() {
}

BattleScene.prototype = {
    init: function(){
    },

    destroy: function(){
    },
};
