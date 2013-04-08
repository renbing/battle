/**
 * 数据模型
 */

var User = {
    _id :   4,
    name : '',          // 名字
    base :  {         
        honor       : 0,        // 荣誉
        level       : 1,        // 荣誉等级
        gold        : 15000,    // 金币
        oil         : 15000,    // 石油
        cash        : 10000,    // 现金
        worker      : 2,        // 工人
        working     : 0,        // 工作中的工人
        oilmax      : 25000,    // 石油上限
        goldmax     : 25000,    // 金币上限
        troopmax    : 0,        // 军队上限
    },
    
    map :   {       // 地图
    /* corner : {   位置坐标 x*100+y
        id          建筑ID

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
            honor:          // 获得的荣誉
            damage:         // 损失百分比
            report:         // 战报
            
        }*/
    ],
};

function Model(data) {
    for( var key in data ) {
        this[key] = data[key];
    }
    
    this.buildingCount = {};    // 地图上的建筑物分类统计
    this.buildingMaxLevel = {}; // 地图上建筑最大等级
    this.houseSpace = 0;        // 兵力上限
    
    for( var id in this.troops ) {
        var characterBaseConf = gConfCharacter[id][1];
        this.houseSpace += this.troops[id] * characterBaseConf.HousingSpace;
    }
}

Model.prototype.mapAdd = function(building) {
    var corner = building.ux * 100 + building.uy;
    
    this.map[corner] = building.data;
    
    this.updateBuildingStatistic();
}

Model.prototype.mapRemove = function(building) {
    var corner = building.ux * 100 + building.uy;

    delete this.map[corner];

    this.updateBuildingStatistic();
}

Model.prototype.mapUpdate = function(oldCorner, building) {
    var corner = building.ux * 100 + building.uy;

    delete this.map[oldCorner];

    this.map[corner] = building.data;
}

Model.prototype.updateBuildingStatistic = function() {
    var goldMax = 0;
    var oilMax = 0;
    var troopMax = 0;
    
    this.buildingCount = {};
    this.buildingMaxLevel = {};

    for( var corner in this.map ) {
        var data = this.map[corner];

        var id = data.id;
        var level = data.level;
        if( level <= 0 ) continue;

        var buildingConf = gConfBuilding[id][level];
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

    this.base.goldmax = goldMax;
    this.base.oilmax = oilMax;
    this.base.troopmax = troopMax;
    
    gScene && gScene.updateHud && gScene.updateHud('gold');
    gScene && gScene.updateHud && gScene.updateHud('oil');
};

Model.prototype.canWork = function() {
    if( this.base.working >= this.base.worker ) {
        alert("没有更多的工人");
        return false;
    }

    return true;
};
