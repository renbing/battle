
/*
 * 虚拟建筑物 用于购买建筑时候的临时建筑 V0.2
 */

function VirtualBuilding() {
	this.building = null;
	
	this.commitPanelH = -130;			// 现在固定位置 以后动态改变
}

VirtualBuilding.prototype = {
	commit: function() {
		this.building.view.removeFromParent();
		if( !gScene.buyBuilding(this.building) ) {
			this._cleanUp();
			return;
		}
		gScene.world.moveArrow.close();
		var buyPanel = this.building.view.getChildByName('buy_panel');
		buyPanel.removeFromParent();
		var buildingBase = this.building.view.getChildByName('base');
		buildingBase.gotoAndStop(1);
		this.building = null;
	},
	cancle: function() {
		this._cleanUp();
	},
	_cleanUp: function() {
		this.building.view.removeFromParent();
		this.building = null;
	},
	setBuilding: function(id) {
		// todo: 购买建筑初始位置 后期根据规则添加
		// var corner = 
	    var data = {
            id: id,
            level: 1,
            state: 0,
            timer: 0,
        };
	    this.building = new Building(World.virtualBuildingID, data);
	    var commitPanel = textureManager.createMovieClip('building', 'buy_building_verify');
	    commitPanel.name = 'buy_panel';
	    commitPanel.y = this.commitPanelH;
	    this.building.view.addChild(commitPanel);
	    var buildingBase = this.building.view.getChildByName('base');
	    var commitButton = commitPanel.getChildByName('ok');
	    var cancelButton = commitPanel.getChildByName('cancel');
	    if( this.building._canPutDown() == true ) {
	    	buildingBase.gotoAndStop(2);
	    	commitButton.visible = true;
	    } else {
	    	buildingBase.gotoAndStop(3);
	    	commitButton.visible = false;
	    }
	    
	    commitButton.addEventListener(Event.TAP, this.commit.bind(this));
	    cancelButton.addEventListener(Event.TAP, this.cancle.bind(this));
	},
}

