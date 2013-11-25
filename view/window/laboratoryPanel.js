
/*
 * 实验室界面   V0.1
 */

function LaboratoryPanel() {
	this.view = null;
	
	this.iconXinFrame = 6;
	this.iconYinFrame = 6;
	
	this.upgradingIconX = 40;
	this.upgradingIconY = 17;
	
	this.iconDistance = 12;
	
	this.iconW = 119;
	this.iconH = 119;
	
	this.armsFrameX = -354;
	this.armsFrameY = -21;
	
	//this.armsFrameW = 158;
	//this.armsFrameH = 256;
	this.armsFrameW = -this.armsFrameX * 2;
	this.armsFrameH = this.iconH * 2 + this.iconDistance;
	
	this.characterIcon = {};
	
	this._init();
}

LaboratoryPanel.prototype = {
	_init: function() {
		this.view = textureManager.createMovieClip('window', 'laboratory_panel');
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		
		this.view.visible = false;
		
		var armsFrame = new MovieClip('arms_frame');
		armsFrame.x = this.armsFrameX;
		armsFrame.y = this.armsFrameY;

		//armsFrame.setClipRect(0, 0, this.armsFrameW, this.armsFrameH);
		this.view.addChild(armsFrame);
		
		this._initCharacterIcon();
		this._loadEvent();
		return;
	},
	
	_initCharacterIcon: function() {
		this.characterIcon['barbarian'] = 'train_troop_0';
		this.characterIcon['archer'] = 'train_troop_1';
		this.characterIcon['goblin'] = 'train_troop_2';
		this.characterIcon['giant'] = 'train_troop_3';
		this.characterIcon['wall_breaker'] = 'train_troop_4';
		this.characterIcon['balloon'] = 'train_troop_5';
		this.characterIcon['wizard'] = 'train_troop_6';
		this.characterIcon['healer'] = 'train_troop_7';
		this.characterIcon['dragon'] = 'train_troop_8';
		this.characterIcon['pekka'] = 'train_troop_9';
	},
	
	open: function(building) {
		this.update(building);
		this.view.visible = true;
	},
	
	close: function() {
		this.view.visible = false;
	},
	
	update: function(building) {
		this._updateTitle(building);
		this._updateArms(building);
		this._updateUpgrading(building);
	},
	
	_loadEvent: function() {
		this.view.getChildByName('close').addEventListener(Event.TAP,
				this.close.bind(this));
	},
	
	_updateTitle: function(building) {
		var title = this.view.getChildByName('title');
		var str = 'Upgrade';
		if (building.data.state == BuildingState.RESEARCH) {
			str += ' in progress';
		}
		title.texture.setText(str);
		return;
	},
	
	_updateUpgrading: function(building) {
		var frame = this.view.getChildByName('upgrading_info');
		if (building.data.state != BuildingState.RESEARCH) {
			frame.visible = false;
			return;
		}
		
		var name = building.data.research;
		
		frame.removeChildByName('icon');
		var iconName = this.characterIcon[name];
		var icon = textureManager.createMovieClip('window', iconName);
		icon.name = 'icon';
		icon.x = this.upgradingIconX;
		icon.y = this.upgradingIconY;
		frame.addChild(icon);
		
		
		var text = frame.getChildByName('const_upgrading');
		text.texture.setText('Upgrading:');
		
		text = frame.getChildByName('name_level');
		var level = gModel.laboratory[name] ? gModel.laboratory[name] : 1;
		text.texture.setText(name + '    (Level ' + level + ' )');
		
		text = frame.getChildByName('const_total_time');
		text.texture.setText('Total time:');
		
		text = frame.getChildByName('time');
        var remainingTime = building.data.timer - Timer.getTime();
        
		var second = Math.floor(remainingTime % 60);
		var minute = Math.floor(remainingTime % 3600 / 60);
		var hour = Math.floor(remainingTime / 60 / 60);
		
		var totalTimeStr = '';
		if (hour != 0) {
			totalTimeStr += hour + 'H';
		}
		if (minute != 0) {
			totalTimeStr += minute + 'M';
		}
		if (second != 0) {
			totalTimeStr += second + 'S';
		}
        text.texture.setText(totalTimeStr);
        
        
        text = frame.getChildByName('const_finish_time');
        text.texture.setText('Finish Upgrade:');
        
        
        var button = frame.getChildByName('cash');
        var cost = button.getChildByName('cost');
        cost.texture.setText('5');
        
        var costIcon = frame.getChildByName('icon');
        costIcon.gotoAndStop(3);
        button.addEventListener(Event.TAP, function(building) {
			return function() {
				building.cash();
			}
		}(building));
        frame.visible = true;
        
        return;
	},
	
	_updateArms: function(building) {
		var frame = this.view.getChildByName('arms_frame');
		if (!frame) return;
		frame.removeAllChild();
		
		var arrayConf = this._getArmsData();
		arrayConf.sort(function(a, b) {
			return a['BarrackLevel'] - b['BarrackLevel'];
		});
		
		arrayConf.forEach(function(v, k) {
			var iconFrame = textureManager.createMovieClip('window', 'laboratory_upgrade_icon');
			iconFrame.name = 'frame_' + k;
			iconFrame.x = Math.floor(k / 2) * (this.iconW + this.iconDistance);
			iconFrame.y = (k % 2) * (this.iconH + this.iconDistance);

			var icon = textureManager.createMovieClip('window', this.characterIcon[v['ID']]);
			icon.x = this.iconXinFrame;
			icon.y = this.iconYinFrame;
			icon.name = 'icon';
			iconFrame.addChildAt(icon, 1);
			
			var levelFrame = iconFrame.getChildByName('level');
			var str = '';
			var level = gModel.laboratory[v['ID']];
			if (level == undefined) {
				level = 1;
			}
			for (var m = 0; m < level; ++m) {
				str += '*';
			}
			levelFrame.texture.setText(str);
			
			var costFrame = iconFrame.getChildByName('cost');
			var nextLevelConf = gConfCharacter[v['ID']][level + 1];
			if (!nextLevelConf) {
				costFrame.texture.setText('--');
			} else {
				costFrame.texture.setText(nextLevelConf['TrainingCost']);
			}
			
			var costTypeFrame = iconFrame.getChildByName('cost_type');
			if (v['TrainingResource'] == 'Oil') {
				costTypeFrame.gotoAndStop(2);
			} else if (v['TrainingResource'] == 'Gold') {
				costTypeFrame.gotoAndStop(1);
			}
			
			frame.addChild(iconFrame);
			
			iconFrame.addEventListener(Event.TAP, function(name,building) {
				return function() {
					building.research(name);
				}
			}(v['ID'], building));
		}, this);
	},
	
	_getArmsData: function() {
		var retData = [];
		for (var k in gConfCharacter) {
			retData.push(gConfCharacter[k][1]);
		}
		return retData;
	},
}


