/**
 * 地图
 */

function LogicMap(w, h) {
    this.data = new Array(w);
    for( var i=0; i<w; i++ ) {
        var row = new Array(h);
        for( var j=0; j<h; j++ ) {
            row[j] = 0;
        }
        this.data[i] = row;
    }
}

LogicMap.prototype = {
    addRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                this.data[x+i][y+j] = 1;
            }
        }
    },

    clearRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                this.data[x+i][y+j] = 0;
            }
        }
    },

    /* 测试一个区域是否与已经存在的碰撞,碰撞返回true,否则false  
     */
    testRect: function(x, y, w, h) {
        for( var i=0; i<w; i++ ) {
            for( var j=0; j<h; j++ ) {
                if( this.data[x+i][y+j] == 1 ) {
                    return true;
                }
            }
        }

        return false;
    },
};
/*
 *           ◀   x(width, row)
 *         ╱
 *       ╱
 *     ╱
 *   ╱
 * ╱
 * ╲
 *   ╲
 *     ╲
 *       ╲
 *         ╲
 *           ◀   y(height, line)
 */
function World() {
    this.view = new MovieClip('world');
    this.view.x = -574*2.5;
    this.view.y = -58*2.5;
    
    this.items = [];
    
    this.moveArrow = new MoveArrow();
    
    this.virtualBuilding = new VirtualBuilding();

    this.logicMap = new LogicMap(World.unitW, World.unitH);
    
    this.selectBuildings = new SelectBuilding();			// 玩家选择建筑物数据
}

World.unitX = 72;   // X轴单位格大小
World.unitY = 54;   // Y轴单位格大小
World.unitW = 40;   // 逻辑宽度
World.unitH = 40;   // 逻辑高度

World.virtualBuildingID = 0;	// 购买建筑的时候 的临时id

World.prototype = {
    add: function(building){
        for( var i=0,max=this.items.length; i<max; i++ ) {
            if( this.items[i].view.y > building.view.y ) {
                break;
            }
        }

        this.items.splice(i, 0, building);
        this.view.addChildAt(building.view, i);
        this.addBlockingRegion(building);
    },
    
    adjustDepth: function(building){
    	building.view.removeFromParent();
        var index = this.items.indexOf(building);
        if( index < 0 ) {
            return;
        }

        this.items.splice(index, 1);

        this.add(building);
    },
    
    bringToFront: function(building) {
    	building.view.removeFromParent();
        this.view.addChild(building.view);
    },
    
    changeResources: function(resName, value) {
    	if( !gScene.updateHud(resName, value) ){
    		return false;
    	}

    	var validBuildings = this._getValidBuildings(resName);
    	if( validBuildings == undefined || 
    		validBuildings.length == 0 ) return;

    	if( value > 0 ) {
        	validBuildings.sort(this._positive);
    	} else {
    		validBuildings.sort(this._reverse);
    	}
    	this._doChangeResource(validBuildings, resName, value);
    	return true;
    },
    
    openMoveArrow: function(building) {
    	if( this.selectWindow == building ) {
    		this.selectWindow = null;
    		this.moveArrow.view.removeFromParent();
    		this.moveArrow.setVisible(false);
    	}
    },
    
    createVirtualBuilding: function(name) {
    	this.virtualBuilding.setBuilding(name);
    	this.view.addChild(this.virtualBuilding.building.view);
    	this.moveArrow.open(this.virtualBuilding.building);
    },
    
    isVirtualBuilding: function(building) {
    	return this.virtualBuilding.building == building;
    },

    addBlockingRegion: function(building) {
    	this.logicMap.addRect(building.ux, building.uy, building.size, building.size);
    },
    
    delBlockingRegion: function(building) {
    	this.logicMap.clearRect(building.ux, building.uy, building.size, building.size);
    },
    
    testBlockingRegion: function(building) {
    	return !this.logicMap.testRect(building.ux, building.uy, building.size, building.size);
    },
    
    getHouseSpaceWithBuildings: function() {
    	var totalHouseSpace = gModel.houseSpace;
    	for (var k = 0, max = this.items.length; k < max; ++k) {
    		var building = this.items[k];
    		if (building.data.name == 'barrack') {
    			totalHouseSpace += this._getProductionQueuePopulation(building);
    		}
    	}
    	return totalHouseSpace;
    },

    _positive: function(a, b) {
    	return a.id - b.id;
    },
    
    _reverse: function(a, b) {
    	return b.id - a.id;
    },
    
    _getValidBuildings: function(resName) {
    	var validBuildings = [];
    	for (var i = 0, max = this.items.length; i < max; ++i) {
    		var building = this.items[i];
    		var buildingData = building.data;

    		var buildingBaseConf = gConfBuilding[buildingData.name][1];
    		if (buildingBaseConf['BuildingClass'] != 'Town Hall' &&
    			buildingBaseConf['BuildingClass'] != 'ResourceStorage') continue;

    		var buildingLevelConf = gConfBuilding[buildingData.name][buildingData.level];
    		var buildingMaxStorage;
    		if( resName == 'oil' ) {
    			buildingMaxStorage = buildingLevelConf['MaxStoredOil'];
    		} else if( resName == 'gold' ) {
    			buildingMaxStorage = buildingLevelConf['MaxStoredGold'];
    		} else return [];

			if( buildingData.storage.hasOwnProperty(resName) ) {
				validBuildings.push(building);
			}
    	}
    	return validBuildings;
    },
    
    _doChangeResource: function(array, resName, value) {
    	for( var k = 0, max = array.length; k < max; ++k) {
    		var building = array[k];
    		var buildingData = building.data;

    		var buildingLevelConf = gConfBuilding[buildingData.name][buildingData.level];
    		var buildingMaxStorage;
    		if( resName == 'oil' ) {
    			buildingMaxStorage = buildingLevelConf['MaxStoredOil'];
    		} else if( resName == 'gold' ) {
    			buildingMaxStorage = buildingLevelConf['MaxStoredGold'];
    		} else return;

    		if( buildingData.storage[resName] + value < 0 ) {
    			value  += buildingData.storage[resName];
    			buildingData.storage[resName] = 0;
    		} else if( buildingData.storage[resName] + value > buildingMaxStorage ) {
    			value -= (buildingMaxStorage - buildingData.storage[resName]);
    			buildingData.storage[resName] = buildingMaxStorage;
    		} else {
    			buildingData.storage[resName] += value;
    			building.update();
    			return;
    		}
    		building.update();
    	}
    },
    
    _getProductionQueuePopulation: function(building) {
    	var task = building.data.task;
    	var total = 0;
    	for (var k = 0, max = task.length; k < max; ++k) {
    		var characterBaseConf = gConfCharacter[task[k][0]][1];
    		var houseSpace = characterBaseConf['HousingSpace'] * task[k][1];
    		total += houseSpace;
    	}
    	return total;
    },
};
