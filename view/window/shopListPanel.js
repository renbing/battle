
/* shop
 * 商店类型界面 V0.1
 */
function ShopListPanel(){
	this.view = null;
	
	this.init();
}

ShopListPanel.prototype = {
	init: function() {
		this.view = textureManager.createMovieClip("window", "shop_list_panel");
		if (this.view == null) {
			return false;
		}
		this.view.x = Device.width/2;
		this.view.y = Device.height/2;
		this._loadEvent();
		this.close();
	},
	open: function(args){
		this.view.visible = true;
	},
	close: function() {
		this.view.visible = false;
	},
	
	update: function() {
		
	},
	
	_loadEvent: function() {
		this.view.getChildByName("close").addEventListener(
				Event.TAP, this.close.bind(this)); 
		for (var k in gConfig.shop) {
			var button = this.view.getChildByName(k);
			button.addEventListener(Event.TAP, function(ui, shopType){
				return  function() {
			    	windowManager.open("shop_buy_list_panel", shopType);
			    	ui.close();
				};
		    }(this, k));
		}
	},
}
