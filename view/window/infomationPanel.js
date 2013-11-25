
/* infomation_panel
 * Info按钮点击弹出的界面	V0.5
 */

function InfomationPanel() {
	this.view = null;
	this.init();
}
InfomationPanel.prototype = {
	init: function() {
		this.view = textureManager.createMovieClip('window', 'infomation_panel');
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		this._loadEvent();
		return;
	},
	open: function(building) {
		if (!building) return;
		this._cleanUp();
		var buildingConf = gConfBuilding[building.data.name][building.data.level];
		
		
		// 设置界面各种属性
		// Title
		var title = this.view.getChildByName('title');
		title.texture.setText(buildingConf['Name'] + '(等级'
				+ building.data.level + ')');
		
		// 建筑图标
		var icon = this.view.getChildByName('icon');
		// todo: set building icon

		// 进度条
		var progressBarData = this._getProgressBarData(building);
		if (!progressBarData) return;
		for (var k in progressBarData) {
			var bar = this.view.getChildByName('progress_bar_' + k);
			bar.getChildByName('icon').gotoAndStop(progressBarData[k].icon);
			var progressBar = new ProgressBar();
			progressBar.init(bar.getChildByName('process_bar'), 1);
			progressBar.setProgress(
					progressBarData[k].current / progressBarData[k].max);
			bar.getChildByName('text').texture.setText(progressBarData[k].text);
			bar.visible = true;
		}
		
		// 建筑说明文字
		var infomation = this.view.getChildByName('infomation');
		infomation.texture.setText('building.data.name == ' + building.data.name
				+ 'building.data.level' + building.data.level
				+ 'name' + buildingConf['Name']);

		
		this.view.visible = true;
	},
	close: function() {
		this.view.visible = false;
	},
	
	update: function(arg) {
		
	},
	
	_loadEvent: function() {
		this.view.getChildByName('close').addEventListener(Event.TAP,
				this.close.bind(this));
	},
	_cleanUp: function() {
		for (var i = 0; i < 3; ++i) {
			this.view.getChildByName('progress_bar_' + i).visible = false;
		}
	},
	_getProgressBarData: function(building) {
		var buildingConf = gConfBuilding[building.data.name][building.data.level];
		var progressBarCount = 0;
		var confWords = ['MaxStoredOil', 'MaxStoredGold', 'HousingSpace',
		                 'ResourceMax', 'Damage', 'Hitpoints'];
		var retData = {};
		for (var k = 0, max = confWords.length; k < max; ++k) {
			if (!buildingConf[confWords[k]]) continue;
			retData[progressBarCount] = {};
			switch(confWords[k]) {
			case 'MaxStoredOil':				// 储油
			case 'MaxStoredGold':				// 储金
				retData[progressBarCount].icon = k + 1;									// 图标
				if (k == 0) {
					retData[progressBarCount].current = building.data.storage['oil'];							// 当前储油量
				} else if (k == 1) {
					retData[progressBarCount].current = building.data.storage['gold'];							// 当前储金量
				}
				retData[progressBarCount].max = buildingConf[confWords[k]];			// 最大量
				retData[progressBarCount].text = 'Storage Capacity: '
					+ retData[progressBarCount].current + '/'
					+ retData[progressBarCount].max;
				break;
			case 'HousingSpace':				// 人口
				retData[progressBarCount].icon = k + 1;									// 图标
				retData[progressBarCount].current = gModel.houseSpace;				// 当前人口
				retData[progressBarCount].max = gModel.base.troopmax;				// 总人口
				retData[progressBarCount].text = 'HousingSpace:'
					+ retData[progressBarCount].current + '/'
					+ retData[progressBarCount].max;
				break;
			case 'ResourceMax':				// 资源生产
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
				var currentProduceSpeed = buildingConf['ResourcePerHour'];					// 当前生产速度
				var maxProduceSpeed = (this._getMaxLevelRow(
						gConfBuilding[building.data.name]))['ResourcePerHour'];
				retData[progressBarCount].current = currentProduceSpeed;
				retData[progressBarCount].max = maxProduceSpeed;
				retData[progressBarCount].text = 'Production Rate: '
					+ buildingConf['ResourcePerHour'] + 'per Hour';
				break;
			case 'Damage':				// 伤害
				retData[progressBarCount].icon = 6;
				var currentDamage = buildingConf['Damage'];
				var maxDamage = (this._getMaxLevelRow(
						gConfBuilding[building.data.name]))['Damage'];
				retData[progressBarCount].current = currentDamage;
				retData[progressBarCount].max = maxDamage;
				retData[progressBarCount].text = 'Damage Per second: '
					+ currentDamage;
				break;
			case 'Hitpoints':				// 建筑血量
				retData[progressBarCount].icon = 7;
				var hitpoints = buildingConf['Hitpoints'];
				retData[progressBarCount].current = hitpoints;
				retData[progressBarCount].max = hitpoints;
				retData[progressBarCount].text = 'Hitpoints: '
					+ hitpoints + '/' + hitpoints;
				break;
			default: return null;	
			}
			progressBarCount++;
			if (progressBarCount > 2) break;
		}
		return retData;
	},
	_getMaxLevelRow: function(table) {
		var ret = table[1];
		for (var k in table) {
			if (table[k].Level > ret.Level) {
				ret = table[k];
			}
		}
		return ret;
	}
}

