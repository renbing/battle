var BuildingState = {
    NORMAL  : 0,
    UPGRADE : 1,
    PRODUCE : 2,
    CLEAR   : 3,
    TRAIN   : 4,
    RESEARCH: 5,
}

function Building(corner, data) {
    this.data = data;

    this.ux = Math.floor(corner/100);
    this.uy = corner%100;

    this.sux = this.ux;
    this.suy = this.uy;

    this.dx = 0;
    this.dy = 0;

    this.buildingBaseConf = gConfBuilding[this.data.id][1];
    this.size = this.buildingBaseConf.Width;
    
    this.view = new MovieClip(corner);

    this.view.addEventListener(Event.DRAG_START, this.onDragStart.bind(this));
    this.view.addEventListener(Event.DRAG, this.onDrag.bind(this));
    this.view.addEventListener(Event.DRAG_END, this.onDragEnd.bind(this));
    this.view.addEventListener(Event.TAP, this.onClick.bind(this));

    this.tipView = null;

    this.update();
}

Building.prototype = {
    onDragStart: function(e) {
        gScene.logicMap 
    },

    onDrag: function(e) {
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
        gScene.world.adjustDepth(this);
    },

    onDragEnd: function(e) {
        this.view.x += this.dx;
        this.view.y += this.dy;

        this.dx = 0;
        this.dy = 0;

        /*
        global.map.clearRect(this.sux, this.suy, this.size, this.size);
        global.graph.update(this.sux, this.suy, this.size, this.size, GraphNodeType.OPEN);
        if( global.map.testRect(this.ux, this.uy, this.size, this.size) ) {
            this.ux = this.sux;
            this.uy = this.suy;

        }else{
            var oldCorner = this.sux * 100 + this.suy;

            this.sux = this.ux;
            this.suy = this.uy;

            global.model.worldUpdate(oldCorner, this);
        }

        global.map.addRect(this.ux, this.uy, this.size, this.size);
        global.graph.update(this.ux, this.uy, this.size, this.size, GraphNodeType.WALL);
        */

        var oldCorner = this.sux * 100 + this.suy;
        gModel.mapUpdate(oldCorner, this);

        this.sux = this.ux;
        this.suy = this.uy;

        this.updatePosition();
    },

    onClick: function(e) {
        var actions = ['info'];

        var now = Timer.getTime();
        if( this.data.state == BuildingState.UPGRADE ) {
            actions = ['info', 'cancel', 'cash'];
        }else if( this.data.state == BuildingState.CLEAR ) {
            actions = ['cancel'];
        }else if( this.data.state == BuildingState.RESEARCH ) {
            actions = ['info', 'upgrade'];
        }else if( this.data.state == BuildingState.PRODUCE ) {
            if( (now - this.data.timer) > 30 ) {
                this.harvest();
                return;
            }
            actions = ['info', 'upgrade'];
        }else if( this.data.state == BuildingState.NORMAL ) {
            if( this.data.id == 'barrack' ) {
                actions = ['info', 'boost', 'upgrade', 'train'];
            }else if( this.data.id == 'labratory' ) {
                actions = ['info', 'upgrade', 'research'];
            }else{
                actions = ['info', 'upgrade'];
            }
        }else if( this.data.state == BuildingState.TRAIN ) {
            actions = ['info', 'upgrade'];
        }
        
        gActionWindow.open(this, actions);
    },

    // 更新位置显示
    updatePosition: function(){
        this.view.x = (this.ux + this.uy + this.size)/2 * World.unitX;
        this.view.y = (-this.ux + this.uy)/2 * World.unitY;
        //trace(this.ux, this.uy, this.view.x, this.view.y);
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
        if( this.data.state == BuildingState.UPGRADE ) return;
        if( !gModel.canWork() ) return;

        var upgradeCost = this.getUpgradeCost();
        if( !upgradeCost ) return;

        var buildingLevelConf = gConfBuilding[this.data.id][this.data.level+1];
        if( this.data.id != 'town_hall' && 
            buildingLevelConf.TownHallLevel > gModel.buildingMaxLevel.townhall ){
            trace('主建筑等级不够');
            return;
        }

        if( !gScene.updateHud(upgradeCost.resource, -upgradeCost.num) ) {
            return;
        }

        var now = Timer.getTime();
        this.data.timer = now + buildingLevelConf.BuildTime * 60;
        this.data.state = BuildingState.UPGRADE;

        gScene.updateHud('working', 1);
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
        }else if( this.buildingBaseConf.BuildingClass == 'Army' ) {
            this.training();
        }

        gScene.updateHud('working', -1);
        gModel.updateBuildingStatistic();

        this.update();
    },

    // 加速升级,清理,研究等
    accelerate: function() {
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
        if( this.view.children.length == 0 ) {
            // 初始化
            var base = textureManager.createMovieClip('building', 'base'+this.size);
            this.view.addChild(base);

            var building = textureManager.createMovieClip('building', this.data.id);
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
            //soundManager.playEffect('coins_collect_01.wav');
        }else if( this.data.id == 'oil_pump' ) {
            //soundManager.playEffect('oil_collect_02.wav');
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
            var upgradeCost = this.getUpgradeCost()
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

        var characterLevelConf = global.csv.character.get(character, level + 1);
        if( !characterLevelConf ) {
            trace('无法升级,以及达到顶级');
            return;
        }

        var characterBaseConf = global.csv.character.get(character, 1);
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
        if( this.data.state == BuildingState.UPGRADE ) return;
        if( Math.abs(num) > 1 ) return;

        var task = this.data.task;
        var taskIndex = -1;
        for( var i=0; i<task.length; i++ ) {
            if( task[i][0] == character ) {
                taskIndex = i;
                break;
            }
        }
        
        // 没有可以取消的训练
        if( taskIndex < 0 && num < 0 ) return;

        // 判断当前建筑训练限制
        if( num > 0 ) {
            var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level);
            if( 0 >= buildingLevelConf.UnitProduction ) return;
        }

        var characterBaseConf = global.csv.character.get(character, 1);
        var characterLevel = gModel.laboratory[character];
        var characterLevelConf = global.csv.character.get(character, characterLevel);

        var costResource = characterBaseConf.TrainingResource;
        var costNum = -characterLevelConf.TrainingCost*num;
        if( !gScene.updateHud(costResource, costNum) ) {
            return;
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
    },

    training: function(character) {
        if( this.data.state == BuildingState.TRAIN ) return;

        if( this.data.task.length == 0 ) {
            this.data.state = BuildingState.NORMAL;
            this.data.timer = 0;
        }else {
            var character = this.data.task[0][0];
            var level = gModel.laboratory[character] ? gModel.laboratory[character] : 1;
            var characterLevelConf = global.csv.character.get(character, level);

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

        var characterBaseConf = global.csv.character.get(character, 1);
        gModel.houseSpace += characterBaseConf.HousingSpace;
        if( !gModel.troops[character] ) {
            gModel.troops[character] = 1;
        }else {
            gModel.troops[character] += 1;
        }

        this.data.state = BuildingState.NORMAL;
        this.training();
    },

    info: function() {
    },
};

function ActionWindow(){
    this.view = null;

    this.actionViews = {};
    this.actionWidth = 0;
    this.actionSpanWidth = 10;

    this.building = null;
    this.opened = false;

    this.init();
}

ActionWindow.prototype = {
    init: function() {
        this.view = new MovieClip('action_window');
        this.view.visible = false;
        this.view.x = Device.width/2;
        this.view.y = Device.height - 100;

        var actions = ['info', 'upgrade', 'cancel', 'boost', 'cash', 'train'];
        actions.forEach(function(action){
            var view = textureManager.createMovieClip('ui', 'action_'+action); 
            view.addEventListener(Event.TAP, function(e){
                this.building[action]();
                this.close();
            }.bind(this));
            this.actionViews[action] = view;
            this.view.addChild(view);
        }, this);

        this.actionWidth = this.actionViews['info'].getChildAt(0).getChildAt(0).width;

        stage.addChild(this.view);
    },

    open: function(building, actions){
        if( building == this.building && this.opened){
            this.close();
            return;
        }

        this.building = building;

        for(var action in this.actionViews) {
            this.actionViews[action].visible = false;
        }

        this.view.visible = true;
        this.opened = true;
        
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
        this.opened = false;
    }
};
