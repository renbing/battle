/**
 * 数据模型
 */

var User = {
    _id :   4,
    name : '',          // 名字
    base :  {
    	ai			: 1,		// 自增长编号ID
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
    /* id : {   
        name        建筑ID
		corner		位置坐标 x*100+y
		
        level       等级
        state       状态 0正常1升级2生产
        timer       计时器

        task        兵营生产队列

        research    实验室研究兵种

		storage		存储 金币 石油 数额
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
    for( var key in User ) {
        this[key] = data[key];
    }
    
    this.buildingCount = {},    // 地图上的建筑物分类统计
    this.buildingMaxLevel = {}, // 地图上建筑最大等级
    this.houseSpace = 0;        // 当前兵力
    
    for( var id in this.troops ) {
        var characterBaseConf = gConfCharacter[id][1];
        this.houseSpace += this.troops[id] * characterBaseConf.HousingSpace;
    }
}

Model.prototype = {
	nextId: function(){
		this.base.ai += 1;
		return this.base.ai;
	},
	
    save: function(){
        var user = {};
        for( var key in User ) {
            user[key] = this[key];
        }
        gNetMgr.call('user', 'save', {'user':user}, function(resp){
            if( resp.code != 0 ) {
                trace('user.save error');
            }else{
                trace('user.save success');
            }
        });
    },

    mapAdd: function(building) {
        this.map[building.id] = building.data;
        
        this.updateBuildingStatistic();
    },

    mapRemove: function(building) {
        delete this.map[building.id];

        this.updateBuildingStatistic();
    },

    updateBuildingStatistic: function() {
        var goldMax = 0;
        var oilMax = 0;
        var troopMax = 0;
        var working = 0;
        
        this.buildingCount = {};
        this.buildingMaxLevel = {};

        for( var id in this.map ) {
            var data = this.map[id];

            if( data.state == BuildingState.UPGRADE || data.state == BuildingState.CLEAR ) {
                working += 1;
            }

            if( !data.level ) return;
            var level = data.level;

            var buildingConf = gConfBuilding[data.id][level];
            goldMax += buildingConf.MaxStoredGold;
            oilMax += buildingConf.MaxStoredOil;
            troopMax += buildingConf.HousingSpace;

            if( !this.buildingCount[data.id] ) {
                this.buildingCount[data.id] = 0;
            }
            this.buildingCount[data.id]++;

            if( !this.buildingMaxLevel[data.id] || this.buildingMaxLevel[data.id] < level ) {
                this.buildingMaxLevel[data.id] = level;
            }
        }

        this.base.goldmax = goldMax;
        this.base.oilmax = oilMax;
        this.base.troopmax = troopMax;
        this.base.working = working;
        
        if( gScene && gScene.updateHud ) {
            gScene.updateHud('gold');
            gScene.updateHud('oil');
            gScene.updateHud('working');
        }
    },

    canWork: function() {
        if( this.base.working >= this.base.worker ) {
            trace("没有更多的工人");
            return false;
        }

        return true;
    },

};
