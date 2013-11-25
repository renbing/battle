
/* shop buy list panel
 * 商店购买界面 V0.1
 */
function ShopBuyListPanel() {
	this.view = null;
	////////////////////////////////////////////////////////
	// 根据资源固定变量
	this.leftRegressionLine = 0;		// 左回归线
	this.rightRegressionLine = 0;		// 右回归线
	this.intervalWidth = 30;			// 宽间距
	this.intervalHeight = 40;			// 高间距
	this.itemWidth = 0;
	this.itemHeight = 0;
	this.damping = 0.5;					// 阻尼
	this.swipeMovingDistance = 400;		// Swipe 事件移动距离
	this.swipeMovingTime = 0.5;			// Swipe 事件移动时间
	////////////////////////////////////////////////////////
	this.itemWindowWidth = 0;

	this.init();
}

ShopBuyListPanel.prototype = {
	init: function() {
		this.view = textureManager.createMovieClip('window', 'shop_buy_list_panel');
		if (this.view == null) {
			return false;
		}
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		
		// 保存初始位置 和位置偏移
		var itemWindow = this.view.getChildByName('item_window');
		this.leftRegressionLine = itemWindow.x;
		this.rightRegressionLine = -this.leftRegressionLine;
		this.initialY = itemWindow.y;
		
		var item = textureManager.createMovieClip('window', 'shop_item');
		var itemElement = item.getChildren();
		var background = (itemElement[0].getChildren())[0];
		this.itemWidth = background.width;
		this.itemHeight = background.height;
		
		this.view.addEventListener(Event.DRAG, this.onDragMove.bind(this));
		this.view.addEventListener(Event.DRAG_END, this.onDragEnd.bind(this));
		this.view.addEventListener(Event.SWIPE, this.onSwipe.bind(this));
		//itemWindow.addEventListener(Event.DRAG, this.onDragMove.bind(this));
		//itemWindow.addEventListener(Event.DRAG_END, this.onDragEnd.bind(this));
		this._loadEvent();
		this.close();
	},
	open: function(args) {
		this._updateContent(args);
		// 根据商店类型 从building表中获取需要显示的内容
		this.view.visible = true;
	},
	close: function() {
		this.view.visible = false;
	},
	
	update: function(arg) {
		
	},
	
	onDragMove: function(e) {
		if (this.itemWindowWidth < this.rightRegressionLine - this.leftRegressionLine) {
			return;
		}
		var itemWindow = this.view.getChildByName('item_window');
		var dis = e.move.x;
		if (itemWindow.x > this.leftRegressionLine ||
			itemWindow.x + this.itemWindowWidth < this.rightRegressionLine) {
			dis = dis * this.damping;
		}
		itemWindow.x += dis;
	},
	onDragEnd: function(e) {
		if (this.itemWindowWidth < this.rightRegressionLine - this.leftRegressionLine) {
			return false;
		}
		var itemWindow = this.view.getChildByName('item_window');
		if (itemWindow.x > this.leftRegressionLine) {
			Tween.move(itemWindow, Tween.LINER, 3/60,
					this.leftRegressionLine, itemWindow.y, 0);
			return true;
		}
		else if (itemWindow.x + this.itemWindowWidth < this.rightRegressionLine) {
			Tween.move(itemWindow, Tween.LINER, 3/60,
					this.rightRegressionLine - this.itemWindowWidth, itemWindow.y, 0);
			return true;
		}
		return false;
	},
	onSwipe: function(e) {
		if (this.itemWindowWidth < this.rightRegressionLine - this.leftRegressionLine) {
			return;
		}
		////////////////////////////////////////////////
		// 当swipe的时候 item window 已经超出范围 则 直接调用 拖拽结束 事件
		//if (this.onDragEnd()) {
		//	return;
		//}
		////////////////////////////////////////////////
		var itemWindow = this.view.getChildByName('item_window');
		switch(e.direction) {
		case Event.SWIPE_LEFT: {
			// 当 Swipe 超出回归线
			if (itemWindow.x + this.itemWindowWidth < this.rightRegressionLine) {
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT, this.swipeMovingTime,
					this.rightRegressionLine - this.itemWindowWidth, itemWindow.y, 0);
			}
			else if (itemWindow.x + this.itemWindowWidth
					- this.swipeMovingDistance < this.rightRegressionLine) {
				// 计算当前swipe 超出 回归线 期望距离
				var beyondTheDistance = this.rightRegressionLine
					- (itemWindow.x + this.itemWindowWidth - this.swipeMovingDistance);
				// 计算阻尼后 实际应该移动到的位置
				var endPosition = this.rightRegressionLine - beyondTheDistance * this.damping;
				/*	自算……如果效果不好 得改……
				 	T1 = Tz * (S1 / Sz)
				 	T2 = Tz - T1
					T2/2 + T1:回归时间
					(Tz+T1)/2
					(Tz+Tz*(S1/Sz))/2
					(Tz*(1+S1/Sz))/2
				 */
				var toEndTime = (this.swipeMovingTime *
						(1 + (itemWindow.x + this.itemWindowWidth
						- this.rightRegressionLine) / this.swipeMovingDistance)) / 2;
				//var toEndTime = (beyondTheDistance / this.swipeMovingDistance) * this.swipeMovingTime;
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT, toEndTime,
					endPosition - this.itemWindowWidth, itemWindow.y, 0).
						seqMove(itemWindow, Tween.STRONG_EASE_OUT, this.swipeMovingTime
								- toEndTime, this.rightRegressionLine
								- this.itemWindowWidth, itemWindow.y, 0);
			}
			else {
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT, this.swipeMovingTime,
						itemWindow.x - this.swipeMovingDistance, itemWindow.y, 0);
			}
		}
		break;
		case Event.SWIPE_RIGHT: {
			// 计算规则同 e.direction == Event.SWIPE_LEFT
			if (itemWindow.x > this.leftRegressionLine) {
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT,
						this.swipeMovingTime, this.leftRegressionLine, itemWindow.y, 0);
			}
			else if (itemWindow.x + this.swipeMovingDistance > this.leftRegressionLine) {
				var endPosition = (itemWindow.x + this.swipeMovingDistance
						- this.leftRegressionLine) * this.damping + this.leftRegressionLine;
				var toEndTime = (this.swipeMovingTime * (1 + (
						this.leftRegressionLine - itemWindow.x) / this.swipeMovingDistance)) / 2;
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT, toEndTime, endPosition, itemWindow.y, 0).
					seqMove(itemWindow, Tween.STRONG_EASE_OUT, this.swipeMovingTime
							- toEndTime, this.leftRegressionLine, itemWindow.y, 0);
			}
			else {
				Tween.move(itemWindow, Tween.STRONG_EASE_OUT, this.swipeMovingTime,
						itemWindow.x + this.swipeMovingDistance, itemWindow.y, 0);
			}
		}
		break;
		default: return;
		}
		return;
	},
	_loadEvent: function() {
		this.view.getChildByName("close").addEventListener(Event.TAP,
				this.close.bind(this)); 

		this.view.getChildByName("back").addEventListener(Event.TAP, function(){
			windowManager.open("shop_list_panel");
			this.close();
		}.bind(this));
	},
	_updateContent: function(shopType) {
		this._clearContent();
		var itemWindow = this.view.getChildByName('item_window');
		for (var id in gConfig.shop[shopType]) {
			var buildingName = gConfig.shop[shopType][id];
			var item = textureManager.createMovieClip("window", "shop_item");
			item.name = id;
			var position = this._getItemPositionByIndex(id);
			item.x = position.x;
			item.y = position.y;
			itemWindow.addChild(item);

			// 更改item属性
			var text = item.getChildByName("cost_text");
			text.texture.setText("money" + id);			// test
			
			var icon = item.getChildByName("cost_type");
			
			var buildRes = gConfBuilding[buildingName][1]['BuildResource'].
				toLowerCase().toLowerCase();
			if (buildRes == 'gold') {
				icon.gotoAndStop(1);
			}else if (buildRes == 'oil') {
				icon.gotoAndStop(2);
			}else if (buildRes == 'cash') {
				icon.gotoAndStop(3);
			}else {
				icon.visible = false;
			}

			item.addEventListener(Event.TAP, function(id, window) {
				return function() {
					gScene.world.createVirtualBuilding(id);					// todo: 买的时候 不直接加入model 确定之后再加入model
					window.close();
				}
			}(buildingName, this));
		}
		this.itemWindowWidth = (Math.ceil(gConfig.shop[shopType].length / 2) - 1)
			* (this.intervalWidth + this.itemWidth) + this.itemWidth;
	},
	_clearContent: function() {
		var itemWindow = this.view.getChildByName('item_window');
		itemWindow.x = this.leftRegressionLine;
		itemWindow.removeAllChild();
		this.itemWindowWidth = 0;
	},
	_getItemPositionByIndex: function(index) {
		var position = {};
		position.x = Math.floor(index / 2) * (this.intervalWidth + this.itemWidth);
		position.y = index % 2 == 0 ? 0 : this.itemHeight + this.intervalHeight;
		return position;
	},
}
