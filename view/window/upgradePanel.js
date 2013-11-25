
/* upgrade_panel
 * Upgrade按钮点击弹出的界面		V0.7
 */

function UpgradePanel() {
	this.view = null;
	this.infoWindow = {};
	//this.iconDistance = 7;				// 每个图标间隔像素
	this.infoStartingX = -301;				// info区域起始位置
	this.infoStartingY = 25;
	this.init();
}

UpgradePanel.prototype = {
	init: function() {
		this.view = textureManager.createMovieClip('window', 'upgrade_panel');
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		this._loadEvent();
		return;
	},
	open: function(building) {
		if (!building) return;
		this._cleanUp();
		var buildingConf = gConfBuilding[building.data.name][building.data.level];
		var buildingBaseConf = gConfBuilding[building.data.name][1];
		var nextLevelRow = this._getRowByLevel(gConfBuilding[building.data.name], 
				building.data.level + 1);
		if (!nextLevelRow) return;
		
		///////////////////////////////////////////////////////////////////////////
		// 设置界面各种属性
		// Title
		var title = this.view.getChildByName('title');
		title.texture.setText('Upgrade to level ' + (building.data.level + 1) + '?');
		
		// 建筑图标
		var icon = this.view.getChildByName('icon');
		// todo: set building icon

		// 建筑升级时间
		var upgradeTime = this.view.getChildByName('time').getChildByName('time');
		upgradeTime.texture.setText(this._getStrTime(nextLevelRow['BuildTime']));
		
		// 进度条
		var progressBarData = this._getProgressBarData(building);
		if (!progressBarData) return;
		for (var k in progressBarData) {
			var bar = this.view.getChildByName('progress_bar_' + k);
			bar.getChildByName('icon').gotoAndStop(progressBarData[k].icon);
			var progressBar = new ProgressBar();
			progressBar.init(bar.getChildByName('process_bar'), 1);
			progressBar.setProgress(progressBarData[k].current / progressBarData[k].max, 
					progressBarData[k].next / progressBarData[k].max);
			bar.getChildByName('text').texture.setText(progressBarData[k].text);
			bar.visible = true;
		}
		
		// 升级说明
		if (buildingBaseConf['BuildingClass'] == 'Defence') {
			if (!this.infoWindow['Defence']) {
				this.infoWindow['Defence'] = textureManager.createMovieClip(
						'window', 'damage_info');
				this._setInfoBaseAttr(this.infoWindow['Defence']);
			}
			this._fillDamageInfoByTable(this.infoWindow['Defence'], buildingBaseConf);
			this.view.addChild(this.infoWindow['Defence']);
			this.infoWindow['Defence'].visible = true;
		}
		else if (buildingBaseConf['BuildingClass'] == 'Town Hall') {
			if (!this.infoWindow['Town Hall']) {
				this.infoWindow['Town Hall'] = textureManager.createMovieClip('window', 
						'town_hall_upgrade_info');
				this._setInfoBaseAttr(this.infoWindow['Town Hall']);
			}
			this.view.addChild(this.infoWindow['Town Hall']);
			this.infoWindow['Town Hall'].visible = true;
		}
		
		// 升级按钮
		var button = this.view.getChildByName('ok');
		var note = this.view.getChildByName('note');
		var upgradeResource = buildingBaseConf['BuildResource'].toLowerCase();
		var needLevel = nextLevelRow['TownHallLevel'];
		if (needLevel && needLevel > gModel.buildingMaxLevel['town_hall']) {
			button.gotoAndStop(2);
			if (upgradeResource == 'gold') {
				button.getChildByName('icon').gotoAndStop(4);
			}else if (upgradeResource == 'oil') {
				button.getChildByName('icon').gotoAndStop(5);
			}else if (upgradeResource == 'cash') {
				button.getChildByName('icon').gotoAndStop(6);
			}else {
				return;
			}
			note.visible = true;
			var strTip = 'You need to upgreade your Town Hall to level' + needLevel.Level;
			note.getChildByName('text').texture.setText(strTip);
			button.addEventListener(Event.TAP, function(str, window) {
				return function() {
					window._cantUpgrade(str);
				};
			}(strTip, this));
		}
		else {
			button.gotoAndStop(1);
			if (upgradeResource == 'gold') {
				button.getChildByName('icon').gotoAndStop(1);
			}else if (upgradeResource == 'oil') {
				button.getChildByName('icon').gotoAndStop(2);
			}else if (upgradeResource == 'cash') {
				button.getChildByName('icon').gotoAndStop(3);
			}else {
				return;
			}
			note.visible = false;
			button.addEventListener(Event.TAP, function(building, self) {
				return function() {
					self._onUpgrade(building);
				}
			}(building, this));
		}
		button.getChildByName('cost').texture.setText(nextLevelRow['BuildCost']);
		///////////////////////////////////////////////////////////////////////////
		this.view.visible = true;
	},
	close: function() {
		this.view.visible = false;
	},
	
	update: function() {
		
	},
	
	_onUpgrade: function(building) {
		if (!building.upgrade()) {
			// 弹出购买宝石界面啊！！
		}
		this.close();
	},
	_cantUpgrade: function(str) {
		// todo: tips!
		return;
	},
	_loadEvent: function() {
		this.view.getChildByName('close').addEventListener(Event.TAP,
				this.close.bind(this));
	},
	_cleanUp: function() {
		for (var i = 0; i < 3; ++i) {
			this.view.getChildByName('progress_bar_' + i).visible = false;
		}
		this.view.removeChildByName('info');
	},
	_setInfoBaseAttr: function(info) {
		info.x = this.infoStartingX;
		info.y = this.infoStartingY;
		info.name = 'info';
	},
	_getRowByLevel: function(table, level) {
		for (var k in table) {
			if (table[k].Level == level) {
				return table[k];
			}
		}
		return null;
	},
	_getMaxLevelRow: function(table) {
		var ret = table[1];
		for (var k in table) {
			if (table[k].Level > ret.Level) {
				ret = table[k];
			}
		}
		return ret;
	},
	_getStrTime: function(time) {
		var strUpdataTime = '';
		var day = Math.floor(time / 60 / 24);
		var hour = Math.floor((time / 60) % 24);
		var min = Math.floor(time % 60);
		if (day != 0) {
			strUpdataTime += day + 'D';
		}
		if (hour != 0) {
			strUpdataTime += hour + 'H';
		}
		if (min != 0) {
			strUpdataTime += min + 'M';
		}
		return strUpdataTime;
	},
	_getProgressBarData: function(building) {
		var buildingConf = gConfBuilding[building.data.name][building.data.level];
		var nextLevelConf = this._getRowByLevel(gConfBuilding[building.data.name],
				building.data.level + 1);
		var maxLevelConf = this._getMaxLevelRow(gConfBuilding[building.data.name])
		var progressBarCount = 0;
		var confWords = ['MaxStoredOil', 'MaxStoredGold', 'HousingSpace',
		                 'ResourceMax', 'Damage', 'Hitpoints'];
		var retData = {};
		for (var k = 0, max = confWords.length; k < max; ++k) {
			if (!buildingConf[confWords[k]]) continue;
			retData[progressBarCount] = {};
			retData[progressBarCount].current = buildingConf[confWords[k]];
			retData[progressBarCount].next = nextLevelConf[confWords[k]];
			retData[progressBarCount].max = maxLevelConf[confWords[k]];
			
			var strReplace = '';
			if (retData[progressBarCount].next == retData[progressBarCount].current) {
				strReplace = retData[progressBarCount].current;
			}
			else {
				strReplace = retData[progressBarCount].current + '+'
					+ (retData[progressBarCount].next
							- retData[progressBarCount].current);
			}
			switch(confWords[k]) {
			case 'MaxStoredOil':				// 储油
			case 'MaxStoredGold':				// 储金
				retData[progressBarCount].icon = k + 1;
				retData[progressBarCount].text = 'Storage Capacity: ' + strReplace;
				break;
			case 'HousingSpace':				// 人口
				retData[progressBarCount].icon = k + 1;
				retData[progressBarCount].text = 'Troop capacity: ' + strReplace;
				break;
			case 'ResourceMax':				// 产出资源
				var buildingBaseConf = gConfBuilding[building.data.name][1];
				var produceType = buildingBaseConf['ProducesResource'];
				if (produceType == 'Oil') {
					retData[progressBarCount].icon = 4;
				} else if (produceType == 'Gold') {
					retData[progressBarCount].icon = 5;
				} else {
					trace('生产资源最大量 error...infomation.js');
					return null;
				}
				retData[progressBarCount].text = 'Production Rate: '
					+ strReplace + ' per Hour';
				break;
			case 'Damage':				// 伤害
				retData[progressBarCount].icon = 6;
				retData[progressBarCount].text = 'Damage Per second: ' + strReplace;
				break;
			case 'Hitpoints':				// 血量
				retData[progressBarCount].icon = 7;
				retData[progressBarCount].text = 'Hitpoints: ' + strReplace;
				break;
			default: return null;
			}
			progressBarCount++;
			if (progressBarCount > 2) break;
		}
		return retData;
	},
	_fillDamageInfoByTable: function(infomation, buildingBaseConf) {
		var text = infomation.getChildByName('range');
		var str = buildingBaseConf['MinAttackRange'];
		if (str) {
			str += ' - ';
		} else {
			str = '';
		}
		str += buildingBaseConf['AttackRange'];
		text.texture.setText(str + ' Tiles');
		
		text = infomation.getChildByName('damage_type');
		str = buildingBaseConf['DamageRadius'];
		if (str) {
			str = 'Area Splash';
		} else {
			str = 'Single Target';
		}
		text.texture.setText(str);
		
		text = infomation.getChildByName('targets');
		str = null;
		if (buildingBaseConf['AirTargets']) {
			str = 'Ground';
		}
		if (buildingBaseConf['GroundTargets']) {
			if (str) {
				str += '& Air';
			}
			else {
				str = 'Air';
			}
		}
		text.texture.setText(str);
		// todo: 这个还不知道是干啥的 现在能看到的全是ANY 以后知道了再改吧
		text = infomation.getChildByName('favorite_target');
		text.texture.setText('Any');
		infomation.visible = true;
	},
	_fillDamageInfoByTable: function(infomation, toLevel) {
		this._cleanInfo(infomation);
		var aidLevelRow = gConfTownHall[toLevel];
		var currentLevelRow = gConfTownHall[toLevel - 1];
		var iconIndex = 0;
		for (var k in aidLevelRow){
			if (k == 'Level' || k == 'MatchGame') continue;
			if (currentLevelRow[k] == aidLevelRow[k]) continue;
			var icon = infomation.getChildByName('icon' + iconIndex);
			if (currentLevelRow[k] == 0) {
				icon.getChildByName('count').texture.setText('new');
			} else {
				icon.getChildByName('count').texture.setText('x '
						+ (aidLevelRow[k] - currentLevelRow[k]))
			}
			icon.getChildByName('name').texture.setText(k);
			icon.visible = true;
			iconIndex++;
		}
	},
	_cleanInfo: function(infomation) {
		var children = infomation.getChildren();
		for (var k in children) {
			children[k].visible = false;
		}
	}
}




