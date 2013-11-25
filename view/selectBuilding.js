
/*
 * 选择建筑物 所有跟选择建筑物相关的操作 从这里读取数据  V0.1
 */

function SelectBuilding() {
	this.select = null;
	this.row = [];
}

SelectBuilding.prototype = {
    setSelect: function(select) {
    	if (this.select == select && 
    			this.row.length < 2) {
    		this.clearSelect();
    		return;
    	}
    	this.select = select;
    },
    
    getSelect: function() {
    	return this.select;
    },
    
    setSelectRow: function(row) {
    	this.row = row;
    },
    
    getSelectRow: function() {
    	return this.row;
    },
    
    clearSelect: function() {
    	this.select = null;
    	this.row = [];
    },
    
}


