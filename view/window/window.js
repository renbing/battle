
/*
 * 弹出窗口管理界面 V0.3
 */
//////////////////////////////////////////////////////////////////////////////////////////
function WindowManager() {
	this.view = null;
	this.windows = {};
	this.windowsClass = {
		'shop_list_panel' : ShopListPanel,
		'shop_buy_list_panel' : ShopBuyListPanel,
		'infomation_panel' : InfomationPanel,
		'upgrade_panel' : UpgradePanel,
		'train_troop_panel' : TrainTroopPanel,
		'laboratory_panel' : LaboratoryPanel,
	};
}

WindowManager.prototype = {
	init: function() {
		this.view = new MovieClip('window');
		stage.addChild(this.view);
	},
	open: function(name, args) {
		var openWindow = this.windows[name];
		if (!openWindow){
			openWindow = new this.windowsClass[name];
			this.view.addChild(openWindow.view);
			this.windows[name] = openWindow;
		}
		openWindow.open(args);
	},
	close: function(name) {
		var closeWindow = this.windows[name];
		closeWindow && closeWindow.close();
	},
	
	update: function(name, arg) {
		var openWindow = this.windows[name];
		if (!openWindow) return;
		openWindow.update(arg);
	},
};

var windowManager = new WindowManager();
