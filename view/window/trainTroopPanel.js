
/*
 * 训练士兵界面  V0.1
 */

function TrainTroopPanel() {
	this.iconX = 6;
	this.iconY = 6;
	this.iconWidth = 106;
	this.iconScale = 0.6;
	this.trainingFrameIconCount = 5;
	
	this.view = null;
	
	this.associateBuilding = null;
	
	this.armsIcon = {};
	this._init();
}

TrainTroopPanel.prototype = {
	_init: function() {
		this.view = textureManager.createMovieClip('window', 'train_troop_panel');
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		
		this.view.visible = false;
		
		this._initArmsIcon();
		this._loadEvent();
		return;
	},
	
	_initArmsIcon: function() {
		// 加载图片资源 没有资源 写死代码里。。。暂时
		this.armsIcon['barbarian'] = 'train_troop_0';
		this.armsIcon['archer'] = 'train_troop_1';
		this.armsIcon['goblin'] = 'train_troop_2';
		this.armsIcon['giant'] = 'train_troop_3';
		this.armsIcon['wall_breaker'] = 'train_troop_4';
		this.armsIcon['balloon'] = 'train_troop_5';
		this.armsIcon['wizard'] = 'train_troop_6';
		this.armsIcon['healer'] = 'train_troop_7';
		this.armsIcon['dragon'] = 'train_troop_8';
		this.armsIcon['pekka'] = 'train_troop_9';
	},
	
	open: function(building) {
		if (!building) return;

		var name = building.data.name;
		var level = building.data.level;

		if (name != 'barrack') return;
		this.view.visible = true;
		this.associateBuilding = building;
		this.update(building);
	},
	
	close: function() {
		this.view.visible = false;
		this.associateBuilding = null;
	},
	
	_loadEvent: function() {
		this.view.getChildByName('close').addEventListener(Event.TAP,
				this.close.bind(this));
	},
	
	updateTime: function(building) {
		if (this.view.visible == false) return;
		if (this.associateBuilding != building) return;
		
		var task = building.data.task;
		var timer = building.data.timer;
		var trainingFrame = this.view.getChildByName('training_frame');
		var timeFrame = this.view.getChildByName('time');
		
		if (task.length < 1 || timer <= 0) {
			trainingFrame.visible = false;
			timeFrame.visible = false;
			return;
		}
		
		var totalTime = 0;
		for (var k = 0, kmax = task.length; k < kmax; ++k) {
			var characterBaseConf = gConfCharacter[task[k][0]][1];
			var singleTime = characterBaseConf['TrainingTime'];
			totalTime += singleTime * task[k][1];
		}
		var second = Math.floor(totalTime % 60);
		var minute = Math.floor(totalTime % 3600 / 60);
		var hour = Math.floor(totalTime / 60 / 60);
		var totalTimeStr = hour + 'H' + minute + 'M' + second + 'S';
		var totalTimeWindow = timeFrame.getChildByName('total_time');
		totalTimeWindow.texture.setText(totalTimeStr);
		
		var str = 'Total time：';
		var constText = timeFrame.getChildByName('const_total_time');
		constText.texture.setText(str);
		
		str = 'Finish Training：';
		constText = timeFrame.getChildByName('const_total_time');
		
		var button = timeFrame.getChildByName('button');
		var cost = button.getChildByName('cost');
		cost.texture.setText('5');
		
		var costType = button.getChildByName('cost_type');
		costType.gotoAndStop(3);
		
		button.addEventListener(Event.TAP, function(building) {
			return function() {
				building.cash();
			}
		}(building));
	},
	
	_updateTitle: function(building) {
		var name = building.data.name;
		var level = building.data.level;
		
		var buildingConf = gConfBuilding[name][level];
		
		var currentCount = 0;
		var maxCount = buildingConf['UnitProduction'];
		building.data.task.forEach(function(v, k) {
			var character = gConfCharacter[v[0]][1];
			var houseSpace = character['HousingSpace'] * v[1];
			currentCount += houseSpace;
		});
		var title = 'Train ' + currentCount + '/' + maxCount;
		
		var titleInterface = this.view.getChildByName('title');
		titleInterface.texture.setText(title);
	},
	
	_updateTrainingFrame: function(building) {
		var task = building.data.task;
		var trainingFrame = this.view.getChildByName('training_frame');
		
		if (task.length < 1) {
			trainingFrame.visible = false;
			return;
		} else {
			trainingFrame.visible = true;
		}
		for (var k = 0; k < this.trainingFrameIconCount; ++k) {
			var trainingIcon = trainingFrame.getChildByName('training' + k);
			trainingIcon.visible = false;
		}
		
		for (var k = 0, max = task.length; k < max; ++k) {
			var trainingIcon = trainingFrame.getChildByName('training' + k);
			
			trainingIcon.removeChildByName('icon');
			
			var icon = textureManager.createMovieClip('window', this.armsIcon[task[k][0]]);
			icon.getChildren()[0].getChildren()[0].scaleX = this.iconScale;
			icon.getChildren()[0].getChildren()[0].scaleY = this.iconScale;
			trainingIcon.addChildAt(icon, 0);
			
			var count = trainingIcon.getChildByName('count');
			count.texture.setText(task[k][1]);
			
			var cancel = trainingIcon.getChildByName('cancel');
			cancel.addEventListener(Event.TAP, function(name, building, window) {
				return function() {
					if (building.train(name, -1)) {
						window._updateTrainingFrame(building);
					}
				};
			}(name, building, this));
			trainingIcon.visible = true;
		}
		
		var currentTrainingIcon = trainingFrame.getChildByName('training' + 0);

        var progressBarWindow = textureManager.createMovieClip('window', 'training_progress_bar');
        progressBarWindow.x = 0;
        progressBarWindow.y = 54;
        currentTrainingIcon.addChild(progressBarWindow);
        
        var text = new TextField();
        text.font = '18px sans-serif';
        text.align = "center";
        text.width = 70;
        text.height = 20;
        text.render();
        
        var textView = new Bitmap(text, 'time');
        textView.x = 2;
        textView.y = 54;
        currentTrainingIcon.addChild(textView);
        
        
        // 更新trainingFrame中的训练时间 以后看情况 移到updateTime中去
        if (gModel.houseSpace >= gModel.base.troopmax) {
        	text.setText('Stop!!!')
        }
        else {
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
            text.setText(totalTimeStr);
        }
        
        var characterBaseConf = gConfCharacter[task[0][0]][1];
        var trainTime = characterBaseConf['TrainingTime'];
        
        var progressBar = new ProgressBar();
        progressBar.init(progressBarWindow, 1);
        progressBar.setProgress(remainingTime / trainTime);
        
        var totalHouseSpace = gScene.world.getHouseSpaceWithBuildings();
        var upperLimitHouseSpace = gModel.base.troopmax;
        var houseSpaceWindow = trainingFrame.getChildByName('house_space');
        houseSpaceWindow.texture.setText('Troop capacity after training:   ' + totalHouseSpace + '/' + upperLimitHouseSpace);
	},
	
	_updateArms: function(building) {
		var level = building.data.level;
		
		var arrayConf = [];
		for (var k in gConfCharacter) {
			arrayConf.push(gConfCharacter[k][1]);
		}
		
		arrayConf.sort(function(a, b) {
			return a['BarrackLevel'] - b['BarrackLevel'];
		});
		
		for (var k = 0, max = arrayConf.length; k < max; ++k) {
			var armsWindow = this.view.getChildByName('arms' + k);
			
			if (arrayConf[k]['BarrackLevel'] > level) {
				armsWindow.gotoAndStop(2);
				
				var armsName = arrayConf[k]['ID'];
				
				armsWindow.removeChildByName('icon');
				var icon = textureManager.createMovieClip('window', this.armsIcon[armsName]);
				icon.x = this.iconX;
				icon.y = this.iconY;
				armsWindow.addChildAt(icon, 1);
				
				var text = armsWindow.getChildByName('text');
				var strText = 'Level ' + level + 'Barracks Required';
				text.texture.setText(strText);
			} else {
				armsWindow.gotoAndStop(1);

				var armsName = arrayConf[k]['ID'];
				
				armsWindow.removeChildByName('icon');
				var icon = textureManager.createMovieClip('window', this.armsIcon[armsName]);
				icon.x = this.iconX;
				icon.y = this.iconY;
				armsWindow.addChildAt(icon, 1);
				
				var str = '';
				for (var i = 0, bmax = building.data.task.length; i < bmax; ++i) {
					if (building.data.task[i][0] == arrayConf['ID']) {
						str = 'x ' + building.data.task[i][1];
						break;
					}
				}
				var countWindow = armsWindow.getChildByName('count');
				countWindow.texture.setText(str);
				
				str = '';
				var level = gModel.laboratory[armsName];
				if (level == undefined) {
					level = 1;
				}
				for (var m = 0; m < level; ++m) {
					str += '*';
				}
				var levelWindow = armsWindow.getChildByName('level');
				levelWindow.texture.setText(str);
				
				var armsConf = gConfCharacter[armsName][level];
				str = armsConf['TrainingCost'];
				var costWindow = armsWindow.getChildByName('cost');
				costWindow.texture.setText(str);
				
				var costTypeWindow = armsWindow.getChildByName('cost_type');
				var costType = arrayConf[k]['TrainingResource'];
				if (costType == 'Gold') {
					costTypeWindow.gotoAndStop(1);
				} else if (costType == 'Oil') {
					costTypeWindow.gotoAndStop(2);
				} else if (costType == 'Cash') {
					costTypeWindow.gotoAndStop(3);
				}
				
				armsWindow.addEventListener(Event.TAP, function(name, building, window) {
					return function() {
						if (building.train(name, 1)) {
							window._updateTrainingFrame(building);
						};
					};
				}(armsName, building, this));
			};
			
			var info = armsWindow.getChildByName('info');
			// todo: info慢慢做。。。
		};
	},
	
	update: function(arg) {
		var building = arg;
		this._updateTitle(building);
		this._updateArms(building);
		this._updateTrainingFrame(building);
		this.updateTime(building);
	},
}
