
/* 进度条控件
 * 进度条控件 V0.6
 */
function ProgressBar() {
	this.view = null;
	this.type = 0;
}

ProgressBar.prototype = {
	init: function(view, type) {
		this.view = view;
		if (type) {
			this.type = type;
		}
	},
	setProgress: function(percent, exPercent) {
		if (percent == undefined) return;
		var bar = this.view.getChildByName('bar');
		this._setBar(bar, percent);
		
		var exBar = this.view.getChildByName('ex_bar');
		if (exBar == undefined) return;
		
		if (exPercent == undefined) {
			exBar.visible = false;
			return;
		}
		this._setBar(exBar, exPercent);
	},
	_setBar: function(bar, percent) {
		var bgImage = ((this.view.getChildren())[0].getChildren())[0];
		var pbImage = ((bar.getChildren())[0].getChildren())[0];
		if (percent < 0 || percent > 1)  return;
		switch(this.type) {
		// 0 和 2 暂时没用
		case 0: 	// 截断		 (===============|                    )     <- 大概是这个样子
			pbImage.width = bgImage.width * percent;
			break;
		case 1:		// 缩放		 (===============）                    )     <- 大概是这个样子
			pbImage.scaleX = percent;
			break;
		case 2:		// .9.png	 (===============)                    )     <- 大概是这个样子
			// todo: ...
			break;
		default: return;
		}
	}
}

