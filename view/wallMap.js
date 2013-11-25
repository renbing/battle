
/*
 * 城墙 位置-building 的map		V0.1
 */


function WallMap() {
    this.data = new Array(World.unitW * World.unitH);
    this._cleanUp();
}

WallMap.prototype = {
    addRef: function(building) {
    	this.data[building.data.corner] = building;
    },

    clearRef: function(building) {
    	var index = this.data.indexOf(building);
    	if (index < 0) {
    		return;
    	}
    	this.data[index] = null;
    },
    
    _getBuilding: function(x, y) {
    	var corner = x * 100 + y;
    	return this.data[corner];
    },
    
    getRow: function(building) {
    	var x = building.ux;
    	var y = building.uy;
    	
    	var buildings = [building];
    	do {
    		x--;
    		var nextBuilding = this._getBuilding(x, y);
    		if (!nextBuilding || nextBuilding.data.name != 'wall') break;
    		buildings.unshift(nextBuilding);
    	} while(x >= 0);
    	
    	x = building.ux;
    	y = building.uy;
    	
    	do {
    		x++;
    		var nextBuilding = this._getBuilding(x, y);
    		if (!nextBuilding || nextBuilding.data.name != 'wall') break;
    		buildings.push(nextBuilding);
    	} while(x < World.unitW);
    	
    	return buildings;
    },
    
    getLine: function(building) {
    	var x = building.ux;
    	var y = building.uy;
    	
    	var buildings = [building];
    	do {
    		y--;
    		var nextBuilding = this._getBuilding(x, y);
    		if (!nextBuilding || nextBuilding.data.name != 'wall') break;
    		buildings.unshift(nextBuilding);
    	}while(y >= 0);
    	
    	x = building.ux;
    	y = building.uy;
    	
    	do {
    		y++;
    		var nextBuilding = this._getBuilding(x, y);
    		if (!nextBuilding || nextBuilding.data.name != 'wall') break;
    		buildings.push(nextBuilding);
    	} while(y < World.unitH);
    	
    	return buildings;
    },
    
    updateAll: function(buildings) {
		this._cleanUp();
    	for (var k in buildings) {
    		var building = buildings[k];
    		
    		if (building.data.name != 'wall') continue;
    	
    		this.update(building);
    	}
    },
    
    update: function(building) {
    	this.clearRef(building);
    	this.addRef(building);
    },
    
    _cleanUp: function() {
        this.data.forEach(function(v) {
        	v = null;
        });
    },
};


