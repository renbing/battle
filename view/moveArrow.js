
/*
 * 选择建筑物时候的移动指示箭头 V0.1
 */

function MoveArrow() {
	this.view = null;
	this._init();
}

MoveArrow.prototype = {
	_init: function() {
		this.view = textureManager.createMovieClip('building', 'move_arrow');
		this.view.visible = false;
	},
	open: function() {
		var building = gScene.world.selectBuildings.getSelect();
    	if (building == null || building == undefined) {
            this.close();
            return;
    	}
    	
		building.view.addChildAt(this.view, 0);
		this._setPosition(0, 0, building.size);
		this.view.visible = true;
	},
	close: function() {
		this.view.removeFromParent();
		this.view.visible = false;
	},
	_setPosition: function(x, y, size) {
		this.view.x = x;
		this.view.y = y;
		
		var lu = this.view.getChildByName('arrow_lu');
		var ld = this.view.getChildByName('arrow_ld');
		var ru = this.view.getChildByName('arrow_ru');
		var rd = this.view.getChildByName('arrow_rd');
		
		var x = World.unitX * size / 4;
		var y = World.unitY * size / 4;
		
		ru.x = x;
		ru.y = -y;
		
		rd.x = x;
		rd.y = y;
		
		lu.x = -x;
		lu.y = -y;
		
		ld.x = -x;
		ld.y = y;
	},
}

