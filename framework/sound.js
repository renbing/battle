
function SoundManager() {
    // 唯一一个背景音乐
    this.background = null;
    // 多个效果音
    this.effects = {},
    this.effectMuted = false;
    this.backgroundMuted = false;
}

SoundManager.prototype = {
    
    createAudio: function(name) {
        var audio = new Audio();
        audio.src = name;

        return audio;
    },

    playBackground: function(newBackground) {
        if(!newBackground) {
            this.background && this.background.play();
        }else{
            this.background && this.background.pause();
            this.background = this.createAudio(newBackground);
            this.background.autoplay = true;
            this.background.muted = this.backgroundMuted;
        }
    },

    stopBackground: function(bClean) {
        this.background && this.background.pause();
        if(bClean) this.background = null;
    },

    setBackgroundMusicMuted: function(muted) {
        this.backgroundMuted = !!muted;
        this.background && (this.background.muted = this.backgroundMuted);
    },

    playEffect: function(name) {
        if( !(name in this.effects) ) {
            var audio = this.createAudio(name);
            audio.autoplay = true;
            audio.muted = this.effectMuted;
            this.effects[name] = audio;
        }else{
            this.effects[name].play();
        }
    },

    stopEffect: function(name) {
        if( name in this.effects ) {
            this.effects[name].pause();
        }
    },

    stopEffects: function(bClean) {
        for(var name in this.effects) {
            this.effects[name].pause();
        }
        if( bClean ) this.effects = {};
    },

    setEffectMuted: function(muted){
        this.effectMuted = !!muted;
        for(var name in this.effects) {
            this.effects[name].muted = this.effectMuted;
        }
    },
};

var soundManager = new SoundManager();
