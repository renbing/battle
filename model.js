/**
 * 数据模型
 */

var User = {
    _id :   4
    name : '',          // 名字
    base :  {         
        honer      : 0,        // 荣誉
        level       : 1,        // 荣誉等级
        gold        : 15000000, // 金币
        oil         : 15000000, // 石油
        cash        : 1000000,  // 现金
        worker      : 2,        // 工人
        working     : 0,        // 工作中的工人
        oilmax      : 25000000, // 石油上限
        goldmax     : 25000000, // 金币上限
        troopmax    : 0,        // 军队上限
    },
    
    map :   {       // 地图
    /* corner : {   位置坐标 x*100+y
        bid         建筑ID

        level       等级
        state       状态 0正常1升级2生产
        timer       计时器

        task        兵营生产队列

        research    实验室研究兵种

    */
    },

    troops : {      // 军队
    /*
        marine : 10, 兵种:数量
    */
    },

    laboratory : {  // 实验室兵种解锁以及升级等级
    /*
        marine : 1, 兵种:等级
    */
    },

    battle : [
    /* {
            attacker:       // 袭击者
            attacker_name:  // 袭击者名称
            attacker_honor: // 袭击者荣誉
            attacker_group: // 袭击者军团
            troops: {}      // 投放的军队
            gold:           // 被掠夺的金币
            oil:            // 被掠夺的石油
            time:           // 进攻时间
            honer:          // 获得的荣誉
            damage:         // 损失百分比
            report:         // 战报
            
        }*/
    ],
};

function Model(data) {
    for( var key in data ) {
        this[key] = data[key];
    }
    
    this.buildingCount = {};// 地图上的建筑物分类统计
    this.buildingMaxLevel = {}; // 地图上建筑最大等级
    this.world = {};        // 地图上所有的building对象
    this.houseSpace = 0;
    
    for( var id in this.troops ) {
        var characterBaseConf = global.csv.character.get(id, 1);
        this.houseSpace += this.troops[id] * characterBaseConf.HousingSpace;
    }
}

Model.prototype.worldAdd = function(building) {
    var corner = building.ux * 100 + building.uy;
    
    this.world[corner] = building;
    this.map[corner] = building.data;
    
    this.updateBuildingStatistic();
}

Model.prototype.worldRemove = function(building) {
    var corner = building.ux * 100 + building.uy;

    delete this.world[corner];
    delete this.map[corner];

    this.updateBuildingStatistic();
}

Model.prototype.worldUpdate = function(oldCorner, building) {
    var corner = building.ux * 100 + building.uy;

    delete this.world[oldCorner];
    delete this.map[oldCorner];

    this.world[corner] = building;
    this.map[corner] = building.data;
}

Model.prototype.updateHud = function(name, value) {
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

    this.base[name]  = newValue;

    return true;
};

Model.prototype.updateBuildingStatistic = function() {
    var goldMax = 0;
    var oilMax = 0;
    var troopMax = 0;
    
    this.buildingCount = {};
    this.buildingMaxLevel = {};

    for( var corner in this.world ) {
        var building = this.world[corner];
        if( building.buildingClass == "Obstacle" ) continue;

        var id = building.data.id;
        var level = building.data.level;
        if( level <= 0 ) continue;

        var buildingConf = global.csv.building.get(id, level);
        goldMax += buildingConf.MaxStoredGold;
        oilMax += buildingConf.MaxStoredOil;
        troopMax += buildingConf.MaxStoredTroop;

        if( !this.buildingCount[id] ) {
            this.buildingCount[id] = 0;
        }
        this.buildingCount[id] = 0;

        if( !this.buildingMaxLevel[id] || this.buildingMaxLevel[id] < level ) {
            this.buildingMaxLevel[id] = level;
        }
    }

    //this.base.goldmax = goldMax;
    //this.base.oilmax = oilMax;
    this.base.troopmax = troopMax;

    this.updateHud("gold", 0);
    this.updateHud("oil", 0);
};

Model.prototype.canWork = function() {
    if( this.base.working >= this.base.worker ) {
        alert("没有更多的工人");
        return false;
    }

    return true;
};
