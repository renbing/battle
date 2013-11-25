var BuildingState = {
    NORMAL  : 0,
    UPGRADE : 1,
    PRODUCE : 2,
    CLEAR   : 3,
    TRAIN   : 4,
    RESEARCH: 5,
};

function Building(id, data) {
	this.id = id;
    this.data = data;

    this.ux = Math.floor(this.id/100);
    this.uy = this.id%100;

    this.sux = this.ux;
    this.suy = this.uy;

    this.dx = 0;
    this.dy = 0;

    this.buildingBaseConf = gConfBuilding[this.data.id][1];
    this.size = this.buildingBaseConf.Width;
    
    this.view = new MovieClip(this.id);

    //this.view.addEventListener(Event.DRAG_START, this.onDragStart.bind(this));
    this.view.addEventListener(Event.DRAG, this.onDrag.bind(this));
    this.view.addEventListener(Event.DRAG_END, this.onDragEnd.bind(this));
    this.view.addEventListener(Event.TAP, this.onClick.bind(this));

    this.tipView = null;

    this.viewInited = false;
    this.update();
}

Building.prototype = {
	_rowBlocking : 0,
	
    onDragStart: function(e) {
        //gScene.logicMap 
    },

    onDrag: function(e) {
    	
    	var select = gScene.world.selectBuildings;
    	var row = select.getSelectRow();
    	if (row.indexOf(this) >= 0 &&
    			row.length > 1) {
    		row.forEach(function(dis) {
    			return function(building, k) {
    				building.move(dis);
    				if (k == 0) {
    					building._rowBlocking = 0;
    				}
    				if (building._rowBlocking == 0) {
        				if (!building._canPutDown()) {
        					building._rowBlocking = 1;
        				}
    				}
    			};
    		}(e));
    		if (this._rowBlocking == 0) {
        		row.forEach(function(building) {
        			var base = building.view.getChildByName('base');
        			base.gotoAndStop(2);
        		});
    		} else {
        		row.forEach(function(building) {
        			var base = building.view.getChildByName('base');
        			base.gotoAndStop(3);
        		});
    		}
    		return;
    	}
    	
		var selectBuilding = select.getSelect();
		var world = gScene.world;
    	if (selectBuilding != this &&
    			world.isVirtualBuilding(this) == false) {
            return;
    	}
    	if( this.data.id == 'wall' ) {
    		gScene.wallMap.clearRef(this);
    	}
    	
    	this.move(e);

        var okButton = null;
        if( gScene.world.isVirtualBuilding(this) ) {
        	okButton = this.view.getChildByName('buy_panel').getChildByName('ok');
        }

        var buildingBase = this.view.getChildByName('base');
        // 检测是否可以放下 改变building.view.'base'
        if( this._canPutDown() ) {
        	buildingBase.gotoAndStop(2);
        	if( okButton ) {
        		okButton.visible = true;
        	}
        } else {
        	buildingBase.gotoAndStop(3);
        	if( okButton ) {
        		okButton.visible = false;
        	}
        }
    },

    onDragEnd: function(e) {
    	// todo: only test
    	this._rowBlocking = 0;
    	
		var selectBuilding = gScene.world.selectBuildings.getSelect();
		var world = gScene.world;
    	if (selectBuilding != this && 
    			world.isVirtualBuilding(this) == false) {
            return;
    	}
    	
        this.view.x += this.dx;
        this.view.y += this.dy;
        
        var buildingBase = this.view.getChildByName('base');
        // 检测是否可以放下 改变building.view.'base'
        if( gScene.world.isVirtualBuilding(this) ) {
        	if( this._canPutDown() ) {
        		buildingBase.gotoAndStop(2);
        	} else {
        		buildingBase.gotoAndStop(3);
        		this.updatePosition();
        		return;
        	}
        } else {
        if( this._canPutDown() ) {
        	if( this._canPutDown() )
	        	buildingBase.gotoAndStop(1);
	        } else {
	        	buildingBase.gotoAndStop(3);
	        	this.updatePosition();
	        	return;
	        }
        }

        this.dx = 0;
        this.dy = 0;
        
    	this.id = this.ux * 100 + this.uy;
    	
        gModel.updateBuildingStatistic();
        this.sux = this.ux;
        this.suy = this.uy;

        this.updatePosition();
        if( !gScene.world.isVirtualBuilding(this) ) {
        	gScene.world.adjustDepth(this);
        	if( this.data.id == 'wall' ) {
        		gScene.wallMap.addRef(this);
        	}
        }
    },

    onClick: function(e) {
    	if( !gScene.world.isVirtualBuilding(null) ) {
    		return;
    	}
        var actions = ['info'];

        var now = Timer.getTime();
        if( this.data.state == BuildingState.UPGRADE ) {
            actions = ['info', 'cancel', 'cash'];
        }else if( this.data.state == BuildingState.CLEAR ) {
            actions = ['cancel'];
        }else if( this.data.state == BuildingState.RESEARCH ) {
            actions = ['info', 'upgrade', 'research'];
        }else if( this.data.state == BuildingState.PRODUCE ) {
            if( (now - this.data.timer) > 30 ) {
                this.harvest();
                return;
            }
            actions = ['info', 'upgrade'];
        }else if( this.data.state == BuildingState.NORMAL ) {
            if( this.data.id == 'barrack' ) {
                actions = ['info', 'boost', 'upgrade', 'train'];
            }else if( this.data.id == 'laboratory' ) {
                actions = ['info', 'upgrade', 'research'];
            } else if( this.data.id == 'wall' &&
            			this._canSelectRow() == true ) {
            		actions = ['info', 'select_row', 'upgrade'];
            } else{
                actions = ['info', 'upgrade'];
            }
        }else if( this.data.state == BuildingState.TRAIN ) {
        	actions = ['info', 'boost', 'upgrade', 'train'];
        }

        gScene.world.selectBuildings.setSelect(this);
        gScene.world.moveArrow.open();
        gActionWindow.open(actions);
        
        gScene.world.delBlockingRegion(this);
    },

    // 更新位置显示
    updatePosition: function(){
        this.view.x = (this.ux + this.uy + this.size)/2 * World.unitX;
        this.view.y = (-this.ux + this.uy)/2 * World.unitY;
        //trace(this.ux, this.uy, this.view.x, this.view.y);
    },
    
    // 移动
    move: function(e) {
        this.dx += e.move.x/gScene.scale;
        this.dy += e.move.y/gScene.scale;

        var dux = Math.round(this.dx/World.unitX - this.dy/World.unitY);
        var duy = Math.round(this.dx/World.unitX + this.dy/World.unitY);

        //trace(this.dx, this.dy, dux, duy);

        if( dux == 0 && duy == 0 ) {
            return;
        }
        
        var ux = this.sux + dux;
        if( ux < 0 ) {
            ux = 0;
        }

        if( ux >= (World.unitW - this.size) ) {
            ux = World.unitW - this.size;
        }
        
        var uy = this.suy + duy;
        if( uy < 0 ) {
            uy = 0;
        }
        if( uy >= (World.unitH - this.size) ) {
            uy = World.unitH - this.size;
        }
        
        this.ux = ux;
        this.uy = uy;

        this.updatePosition();

        gScene.world.bringToFront(this);
    },

    // 获取升级需要的资源
    getUpgradeCost: function() {
        var buildingLevelConf = gConfBuilding[this.data.id][this.data.level+1];
        if( !buildingLevelConf ) {
            trace('已经达到最大等级');
            return;
        }

        return {resource: this.buildingBaseConf.BuildResource, 
                num: buildingLevelConf.BuildCost};
    },

    // 升级
    upgrade: function() {
        if( this.data.state == BuildingState.UPGRADE ) return false;
        if( !gModel.canWork() ) return false;

        var upgradeCost = this.getUpgradeCost();
        if( !upgradeCost ) return false;

        var buildingLevelConf = gConfBuilding[this.data.id][this.data.level+1];
        if( this.data.id != 'town_hall' && 
            buildingLevelConf.TownHallLevel > gModel.buildingMaxLevel.townhall ){
            trace('主建筑等级不够');
            return false;
        }

        if( !gScene.updateHud(upgradeCost.resource, -upgradeCost.num) ) {
            return false;
        }

        var now = Timer.getTime();
        this.data.timer = now + buildingLevelConf.BuildTime * 60;
        this.data.state = BuildingState.UPGRADE;

        gScene.updateHud('working', 1);
        return true;
    },

    // 升级结束
    upgraded: function() {
        if( this.buildingClass == 'Obstacle' ) return;

        // 升级结束,开始生产
        var now = Timer.getTime();

        this.data.level += 1;
        this.data.state = BuildingState.NORMAL;
        
        if( this.buildingBaseConf.BuildingClass == 'Resource' ) {
            this.data.state = BuildingState.PRODUCE;
            this.data.timer = now;
        }else if( this.buildingBaseConf.ID == 'barrack' ) {
            this.training();
        }

        gScene.updateHud('working', -1);
        gModel.updateBuildingStatistic();

        this.update();
    },

    // 加速升级,清理,研究等
    cash: function() {
        if( this.data.state == BuildingState.UPGRADE ) {
            if( !gScene.updateHud('cash', -5) ) return;
            this.upgraded();
        }else if( this.data.state == BuildingState.CLEAR ) {
            if( !gScene.updateHud('cash', -5) ) return;
            this.deleted();
        }else if( this.data.state == BuildingState.RESEARCH ) {
            if( !gScene.updateHud('cash', -5) ) return;
            this.researched();    
        }else if( this.data.state == BuildingState.TRAIN ) {
            if( !gScene.updateHud('cash', -5) ) return;

            var task = this.data.task;
            for( var i=0; i<task.length; i++ ) {
                var character = task[i][0];
                var num = task[i][1];
                if( !gModel.troops[character] ) {
                    gModel.troops[character] = num;
                }else {
                    gModel.troops[character] += num;
                }
            }

            this.data.state = BuildingState.NORMAL;
            this.data.task = [];
        }
    },

    // 更新显示
    update: function() {
        if( !this.viewInited ) {
            // 初始化
            var base = textureManager.createMovieClip('building', 'base'+this.size);
            base.name = 'base';
            this.view.addChild(base);

            var building = textureManager.createMovieClip('building', this.data.id);
            building.name = 'building';
            this.view.addChild(building);

            var tip = new TextField();
            tip.width = 128;
            tip.height = 32;
            tip.align = 'center';
            tip.font = '18px sans-serif';
            tip.render();
            
            this.tipView = new Bitmap(tip, 'tip');
            this.tipView.x = -64;
            this.tipView.y = -100;
            this.tipView.visible = false;

            this.view.addChild(this.tipView);
            
            Timer.addTick(this.onTick.bind(this));

            this.viewInited = true;
        }else{
            // 更新建筑显示 
            this.view.getChildAt(1).gotoAndStop(1);
        }
        
        this.updatePosition();
        this.onTick();
    },

    // 每秒钟的状态更新
    onTick: function() {
        var now = Timer.getTime();
        var tip = this.tipView;
        var tipText = tip.texture;
        tip.visible = true;

        if( this.data.state == BuildingState.UPGRADE ) {
            if( now < this.data.timer ) {
                tipText.setText('升级:' + (this.data.timer - now));
            }else{
                this.upgraded();
                tip.visible = false;
            }
        }else if( this.data.state == BuildingState.PRODUCE ) {
            tipText.setText('生产:' + (now - this.data.timer));
        }else if( this.data.state == BuildingState.CLEAR ) {
            if( now < this.data.timer ) {
                tipText.setText('清理 剩余时间:' + (this.data.timer - now));
            }else{
                this.deleted();
            }
        }else if( this.data.state == BuildingState.TRAIN ) {
            if( now < this.data.timer ) {
                tipText.setText('训练 剩余时间:' + (this.data.timer - now));
            }else{
                tip.visible = this.trained();
            }
            windowManager.update('train_troop_panel', this);
        }else if( this.data.state == BuildingState.RESEARCH ) {
            if( now < this.data.timer ) {
                tipText.setText('研究 剩余时间:' + (this.data.timer - now));
            }else{
                this.researched();
                tip.visible = false;
            }
        }else{
            tip.visible = false;
        }
    },

    harvest: function() {
        if( this.data.state != BuildingState.PRODUCE ) return;

        var buildingLevelConf = gConfBuilding[this.data.id][this.data.level];
        
        var now = Timer.getTime();
        var produceSeconds = now - this.data.timer;
        var output = Math.round(buildingLevelConf.ResourcePerHour * produceSeconds / 3600);
        if( output > buildingLevelConf.ResourceMax ) {
            output = +buildingLevelConf.ResourceMax;
        }

        gScene.updateHud(this.buildingBaseConf.ProducesResource, output);

        this.data.timer = now;
        if( this.data.id == 'gold_mine' ) {
            soundManager.playEffect('gold_collect_01.wav');
        }else if( this.data.id == 'oil_pump' ) {
            soundManager.playEffect('oil_collect_02.wav');
        }
        this.onTick();
    },

    clear: function() {
        if( this.buildingClass != 'Obstacle' ) return;

        var now = Timer.getTime();
        var costResource = this.buildingBaseConf.ClearResource;
        var costNum = -this.buildingBaseConf.ClearCost;
        if( !gScene.updateHud(costResource, costNum) ) return;

        this.data.state = BuildingState.CLEAR;
        this.data.timer = now + this.buildingBaseConf.ClearTimeSeconds;

        gScene.updateHud('working', 1);
    },

    cancel: function() {
        this.data.state = BuildingState.NORMAL;

        if( this.data.state == BuildingState.UPGRADE ) {
            if( this.buildingBaseConf.BuildingClass == 'Resource' ) {
                this.data.state = BuildingState.PRODUCE;
                this.data.timer = 0;
            }
            gScene.updateHud('working', -1);

            // 还钱
            var upgradeCost = this.getUpgradeCost();
            upgradeCost.num = Math.round(-upgradeCost.num/2);
            gScene.updateHud(upgradeCost.resource, upgradeCost.num);
        }
    },

    research: function(character) {
        if( this.data.id != 'laboratory' ) return;
        if( this.data.state != BuildingState.NORMAL ) return;

        var now = Timer.getTime();

        var level = gModel.laboratory[character];
        if( !level ) {
            gModel.laboratory[character] = 1;
            level = 1;
        }

        var characterLevelConf = gConfCharacter[character][level + 1];
        if( !characterLevelConf ) {
            trace('无法升级,以及达到顶级');
            return;
        }

        var characterBaseConf = gConfCharacter[character][1];
        var costResource = characterBaseConf.UpgradeResource;
        var costNum = -characterLevelConf.UpgradeCost;
        if( !gScene.updateHud(costResource, costNum) ) {
            return;
        }

        this.data.state = BuildingState.RESEARCH;
        this.data.timer = now + characterLevelConf.UpgradeTimeH * 3600;
        this.data.research = character;
    },

    researched: function() {
        if( this.data.id != 'laboratory' ) return;
        if( this.data.state != BuildingState.RESEARCH ) return;

        gModel.laboratory[this.data.research] += 1;
        this.data.state = BuildingState.NORMAL;
        this.data.timer = 0;
    },

    train: function(character, num) {
        if( this.data.state == BuildingState.UPGRADE ) return false;
        if( Math.abs(num) > 1 ) return false;

        var task = this.data.task;
        var taskIndex = -1;
        for( var i=0; i<task.length; i++ ) {
            if( task[i][0] == character ) {
                taskIndex = i;
                break;
            }
        }
        
        // 没有可以取消的训练
        if( taskIndex < 0 && num < 0 ) return false;

        // 判断当前建筑训练限制
        if( num > 0 ) {
            var buildingLevelConf = gConfBuilding[this.data.id][this.data.level];
            if( 0 >= buildingLevelConf.UnitProduction ) return false;
        }

        var characterBaseConf = gConfCharacter[character][1];
        var characterLevel = gModel.laboratory[character];
        if (characterLevel == undefined) {
        	characterLevel = 1;
        }
        var characterLevelConf = gConfCharacter[character][characterLevel];

        var costResource = characterBaseConf.TrainingResource;
        var costNum = -characterLevelConf['TrainingCost'] * num;
        if( !gScene.updateHud(costResource, costNum) ) {
            return false;
        }
        
        if( taskIndex < 0 ) {
            task.push([character, num]);
        }else {
            task[taskIndex][1] += num;
            if( task[taskIndex][1] == 0 ) {
                task.splice(taskIndex, 1);
                if( this.data.state == BuildingState.TRAIN && this.data.train == character ) {
                    // 取消正在训练的,且没有更多可以训练的
                    this.data.state = BuildingState.NORMAL;
                }
            }
        }

        this.training();
        return true;
    },

    training: function(character) {
        if( this.data.state == BuildingState.TRAIN ) return;

        if( this.data.task.length == 0 ) {
            this.data.state = BuildingState.NORMAL;
            this.data.timer = 0;
        }else {
            var character = this.data.task[0][0];
            var level = gModel.laboratory[character] ? gModel.laboratory[character] : 1;
            var characterLevelConf = gConfCharacter[character][level];

            var now = Timer.getTime();
            this.data.state = BuildingState.TRAIN;
            this.data.timer = now + characterLevelConf.TrainingTime;
            this.data.train = character;
        }
    },

    trained: function() {
        if( gModel.houseSpace >= gModel.base.troopmax ) {
            trace('没有更多的人口空间');
            return;
        }

        var character = this.data.train;
        var emptyIndex = -1;
        var task = this.data.task;
        for( var i=0; i<task.length; i++ ) {
            if( task[i][0] == character ) {
                task[i][1] -= 1;
                if( task[i][1] == 0 ) {
                    emptyIndex = i;
                }
                break;
            }
        }

        if( emptyIndex >= 0 ) {
            task.splice(emptyIndex, 1);
        }

        var characterBaseConf = gConfCharacter[character][1];
        gModel.houseSpace += characterBaseConf.HousingSpace;
        if( !gModel.troops[character] ) {
            gModel.troops[character] = 1;
        }else {
            gModel.troops[character] += 1;
        }

        this.data.state = BuildingState.NORMAL;
        this.training();
    },
    doAction: function(action){
    	switch (action) {
    	case 'info':
    		windowManager.open('infomation_panel', this);
    		break;
    	case 'upgrade':
    		windowManager.open('upgrade_panel', this);
    		break;
    	case 'cancel':
    		break;
    	case 'boost':
    		break;
    	case 'cash':
    		this.cash();
    		break;
    	case 'train':
    		windowManager.open('train_troop_panel', this);
    		break;
    	case 'research':
    		windowManager.open('laboratory_panel', this);
    		break;
    	case 'select_row':
    		if (!this._canSelectRow()) return;
        	var rowBuildings = gScene.wallMap.getRow(this);
        	var lineBuildings = gScene.wallMap.getLine(this);
        	var targetBuildings = [];
        	if (rowBuildings.length > lineBuildings.length) {
        		targetBuildings = rowBuildings;
        		gScene.world.selectBuildings.setSelectRow(rowBuildings);
        	} else {
        		targetBuildings = lineBuildings;
        		gScene.world.selectBuildings.setSelectRow(lineBuildings);
        	}
        	// todo: 更新移动箭头 更新ActionWindow
        	targetBuildings.forEach(function(v) {
        		var base = v.view.getChildByName('base');
        		base.gotoAndStop(2);
        	});
    		break;
    	case 'rotate_row':
    		break;
    	default: return;
    	}
    },
    
    backInPlace: function() {
    	this.dx = 0;
    	this.dy = 0;
    	
    	this.ux = this.sux;
    	this.uy = this.suy;
    	
    	this.updatePosition();
    	this.view.getChildByName('base').gotoAndStop(1);
    	gScene.world.addBlockingRegion(this);
    	if( this.data.id == 'name' ) {
    		gScene.wallMap.addRef(this);
    	}
    },
    
    // 检测当前建筑物是否可以被放置到当前位置
    _canPutDown: function() {
    	return gScene.world.testBlockingRegion(this);
    },
    
    _canSelectRow: function() {
    	var rowBuildings = gScene.wallMap.getRow(this);
    	var lineBuildings = gScene.wallMap.getLine(this);
    	if (rowBuildings.length == 1 && lineBuildings.length == 1) {
    		return false;
    	}
    	return true;
    },
};

function ActionWindow(){
    this.view = null;

    this.actionViews = {};
    this.actionWidth = 0;
    this.actionSpanWidth = 10;

    this.init();
}

ActionWindow.prototype = {
    init: function() {
        this.view = new MovieClip('action_window');
        this.view.visible = false;
        this.view.x = Device.width/2;
        this.view.y = Device.height - 100;

        var actions = ['info', 'upgrade', 'cancel', 'boost', 'cash', 'train', 'research', 'select_row', 'rotate_row'];
        actions.forEach(function(action){
            var view = textureManager.createMovieClip('ui', 'action_'+action); 
            view.addEventListener(Event.TAP, function(e){
            	var building = gScene.world.selectBuildings.getSelect();
            	if (building == null || building == undefined) return;
            	building.doAction(action);
                this.close();
            }.bind(this));
            this.actionViews[action] = view;
            this.view.addChild(view);
        }, this);

        this.actionWidth = this.actionViews['info'].getChildAt(0).getChildAt(0).width;

        stage.addChild(this.view);
    },

    open: function(actions){
    	var building = gScene.world.selectBuildings.getSelect();
    	if (building == null || building == undefined) {
            this.close();
            return;
    	}

        for(var action in this.actionViews) {
            this.actionViews[action].visible = false;
        }

        this.view.visible = true;
        
        var width = actions.length * this.actionWidth 
                    + (actions.length-1)*this.actionSpanWidth;
        var startX = -width/2;
        actions.forEach(function(action, i){
            var view = this.actionViews[action]; 
            view.x = startX + i*(this.actionWidth + this.actionSpanWidth);
            view.visible = true;
        }, this);
    },

    close: function(){
        this.view.visible = false;
    }
};
