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

    this.view.addEventListener(Event.DRAG, this.onDrag.bind(this));
    this.view.addEventListener(Event.DRAG_END, this.onDragEnd.bind(this));
    this.view.addEventListener(Event.TAP, this.onClick.bind(this));

    this.update();
}

Building.prototype = {

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
        this.sux = this.ux;
        this.suy = this.uy;

        this.updatePosition();
    },

    onClick: function(e) {
        return;
        var now = Math.round(+new Date() / 1000);
        var actions = [];
        if( this.data.state == BuildingState.UPGRADE ) {
            actions.push([UI.BuildingActionType.CANCEL]);
            actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
        }
        else if( this.data.state == BuildingState.CLEAR ) {
            actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
        }
        else if( this.data.state == BuildingState.RESEARCH ) {
            actions.push([UI.BuildingActionType.CANCEL]);
            actions.push([UI.BuildingActionType.ACCELERATE, {cash:5}]);
        }
        else if( this.data.state == BuildingState.PRODUCE ) {
            if( (now - this.data.timer) < 30 ) {
                var upgradeCost = this.getUpgradeCost();
                upgradeCost && actions.push([UI.BuildingActionType.UPGRADE, upgradeCost]);
            }else {
                // 收取资源
                this.harvest();
                return;
            }
        }
        else if( this.data.state == BuildingState.NORMAL || this.data.state == BuildingState.TRAIN ) {
            if( this.buildingClass == "Obstacle" ) {
                actions.push([UI.BuildingActionType.CLEAR, {resource:this.buildingBaseConf.ClearResource, num:this.buildingBaseConf.ClearCost}]);
            }else {
                var upgradeCost = this.getUpgradeCost();
                upgradeCost && actions.push([UI.BuildingActionType.UPGRADE, upgradeCost]);
                if( this.buildingClass == "Army" ) {
                    actions.push([UI.BuildingActionType.TRAIN]);
                }else if( this.buildingClass == "Laboratory" ) {
                    actions.push([UI.BuildingActionType.RESEARCH]);
                }
            }
        }

        if( actions.length > 0 ) {
            global.windows.building_action.update(actions, this);
            global.windows.building_action.show();
        }
    },

    // 更新位置显示
    updatePosition: function(){
        this.view.x = (this.ux + this.uy + this.size)/2 * World.unitX;
        this.view.y = (-this.ux + this.uy)/2 * World.unitY;
        //trace(this.ux, this.uy, this.view.x, this.view.y);
    },

    // 调整景深
    adjustDepth: function(){
        var world = this.view.parent;
        world.removeChild(this.view);

        var mcs = world.getChildren();
        var index = 0;
        for( var i=0; i<mcs.length; i++ ) {
            if( mcs[i].y > this.view.y ) {
                index = i;
                break;
            }
        }

        if( i == mcs.length ) {
            world.addChild(this.view);
        }else{
            world.addChildAt(this.view, index);
        }
    },

    // 获取升级需要的资源
    getUpgradeCost: function() {
        var buildingLevelConf = gConfBuilding[this.data.id][this.data.level+1];
        if( !buildingLevelConf ) {
            alert("已经达到最大等级");
            return;
        }

        return {resource: this.buildingBaseConf.BuildResource, 
                num: buildingLevelConf.BuildCost};
    },

    // 升级
    upgrade: function() {
        if( this.buildingClass == "Obstacle" ) return;

        if( this.data.state == BuildingState.UPGRADE ) return;
        if( !global.model.canWork() ) return;

        var upgradeCost = this.getUpgradeCost();
        if( !upgradeCost ) return;

        var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level+1);
        if( this.data.id != "town_hall" && buildingLevelConf.TownHallLevel > global.model.buildingMaxLevel.townhall ){
            alert("主建筑等级不够");
            return;
        }

        if( !global.model.updateHud(upgradeCost.resource, -upgradeCost.num) ) {
            return;
        }

        var now = Math.round(+new Date() / 1000);
        this.data.timer = now + buildingLevelConf.BuildTime * 60;
        this.data.state = BuildingState.UPGRADE;

        global.model.updateHud("working", 1);

        return true;
    },

    // 升级结束
    upgraded: function() {
        if( this.buildingClass == "Obstacle" ) return;

        // 升级结束,开始生产
        var now = Math.round(+new Date() / 1000);

        this.data.level += 1;
        this.data.state = BuildingState.NORMAL;
        
        if( this.buildingBaseConf.BuildingClass == "Resource" ) {
            this.data.state = BuildingState.PRODUCE;
            this.data.timer = now;
        }else if( this.buildingBaseConf.BuildingClass == "Army" ) {
            this.training();
        }

        global.model.updateHud("working", -1);
        global.model.updateBuildingStatistic();

        this.update();
    },

    // 加速升级,清理,研究等
    accelerate: function() {
        if( this.data.state == BuildingState.UPGRADE ) {
            if( !global.model.updateHud("cash", -5) ) return;
            this.upgraded();
        }else if( this.data.state == BuildingState.CLEAR ) {
            if( !global.model.updateHud("cash", -5) ) return;
            this.deleted();
        }else if( this.data.state == BuildingState.RESEARCH ) {
            if( !global.model.updateHud("cash", -5) ) return;
            this.researched();    
        }else if( this.data.state == BuildingState.TRAIN ) {
            if( !global.model.updateHud("cash", -5) ) return;

            var task = this.data.task;
            for( var i=0; i<task.length; i++ ) {
                var character = task[i][0];
                var num = task[i][1];
                if( !global.model.troops[character] ) {
                    global.model.troops[character] = num;
                }else {
                    global.model.troops[character] += num;
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
            
        }else{
            // 更新建筑显示 
            this.view.getChildAt(1).gotoAndStop(1);
        }
        
        this.updatePosition();
    },

    // 每秒钟的状态更新
    onTick: function() {
        var now = Math.round(+new Date() / 1000);
        var tip = this.view.getChildByName("tip");
        tip.visible = true;

        if( this.data.state == BuildingState.UPGRADE ) {
            if( now < this.data.timer ) {
                tip.getChildAt(0).text = "建造/升级 剩余时间:" + (this.data.timer - now);
            }else{
                this.upgraded();
                tip.visible = false;
            }
        }else if( this.data.state == BuildingState.PRODUCE ) {
                tip.getChildAt(0).text = "生产时间:" + (now - this.data.timer);
        }else if( this.data.state == BuildingState.CLEAR ) {
            if( now < this.data.timer ) {
                tip.getChildAt(0).text = "清理 剩余时间:" + (this.data.timer - now);
            }else{
                this.deleted();
            }
        }else if( this.data.state == BuildingState.TRAIN ) {
            if( now < this.data.timer ) {
                tip.getChildAt(0).text = "训练 剩余时间:" + (this.data.timer - now);
            }else{
                tip.visible = this.trained();
            }
        }else if( this.data.state == BuildingState.RESEARCH ) {
            if( now < this.data.timer ) {
                tip.getChildAt(0).text = "研究 剩余时间:" + (this.data.timer - now);
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

        var buildingLevelConf = global.csv.building.get(this.data.id, this.data.level);
        
        var now = Math.round(+new Date() / 1000);
        var produceSeconds = now - this.data.timer;
        var output = Math.round(buildingLevelConf.ResourcePerHour * produceSeconds / 3600);
        if( output > buildingLevelConf.ResourceMax ) {
            output = +buildingLevelConf.ResourceMax;
        }

        if( !global.model.updateHud(this.buildingBaseConf.ProducesResource, output) ) return;

        this.data.timer = now;
        if( this.data.id == "gold_mine" ) {
            global.soundManager.playEffect("coins_collect_01.wav");
        }else if( this.data.id == "oil_pump" ) {
            global.soundManager.playEffect("oil_collect_02.wav");
        }
    },

    clear: function() {
        if( this.buildingClass != "Obstacle" ) return;

        var now = Math.round(+new Date() / 1000);
        if( !global.model.updateHud(this.buildingBaseConf.ClearResource, -this.buildingBaseConf.ClearCost) ) return;

        this.data.state = BuildingState.CLEAR;
        this.data.timer = now + this.buildingBaseConf.ClearTimeSeconds;

        global.model.updateHud("working", 1);
    },

    cancel: function() {
        var now = Math.round(+new Date() / 1000);

        if( this.data.state == BuildingState.UPGRADE ) {
            this.data.state = BuildingState.NORMAL;
            if( this.buildingClass == "Resource" ) {
                this.data.state = BuildingState.PRODUCE;
                this.data.timer = now;
            }
            global.model.updateHud("working", -1);
        }else if( this.data.state == BuildingState.RESEARCH ) {
            this.data.state = BuildingState.NORMAL;
            this.data.timer = 0;
        }
    },

    research: function(character) {
        if( this.data.id != "laboratory" ) return;
        if( this.data.state != BuildingState.NORMAL ) return;

        var now = Math.round(+new Date() / 1000);

        var level = global.model.laboratory[character];
        if( !level ) {
            global.model.laboratory[character] = 1;
            level = 1;
        }

        var characterLevelConf = global.csv.character.get(character, level + 1);
        if( !characterLevelConf ) {
            alert("无法升级,以及达到顶级");
            return;
        }

        var characterBaseConf = global.csv.character.get(character, 1);
        if( !global.model.updateHud(characterBaseConf.UpgradeResource, -characterLevelConf.UpgradeCost) ) {
            return;
        }

        this.data.state = BuildingState.RESEARCH;
        this.data.timer = now + characterLevelConf.UpgradeTimeH * 3600;
        this.data.research = character;
    },

    researched: function() {
        if( this.data.id != "laboratory" ) return;
        if( this.data.state != BuildingState.RESEARCH ) return;

        global.model.laboratory[this.data.research] += 1;
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
        var characterLevel = global.model.laboratory[character];
        var characterLevelConf = global.csv.character.get(character, characterLevel);

        if( !global.model.updateHud(characterBaseConf.TrainingResource, -characterLevelConf.TrainingCost*num) ) return;
        
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
            var level = global.model.laboratory[character] ? global.model.laboratory[character] : 1;
            var characterLevelConf = global.csv.character.get(character, level);

            var now = Math.round(+new Date() / 1000);
            this.data.state = BuildingState.TRAIN;
            this.data.timer = now + characterLevelConf.TrainingTime;
            this.data.train = character;
        }
    },

    trained: function() {
        if( global.model.houseSpace >= global.model.base.troopmax ) {
            trace("没有更多的人口空间");
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
        global.model.houseSpace += characterBaseConf.HousingSpace;
        if( !global.model.troops[character] ) {
            global.model.troops[character] = 1;
        }else {
            global.model.troops[character] += 1;
        }

        this.data.state = BuildingState.NORMAL;
        this.training();
    },
};
