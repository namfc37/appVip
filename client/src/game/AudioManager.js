function AudioInit ()
{
	var private = {};
	private.engine = null;
	private.music = {
		on: true,
		volume: 1.0,
		volumn_default: 0.2,
		path: ""
	};

	private.effect = {
		on: true,
		volume: 1.0,
		volumn_default: 1.0,
	};

	//web private.engine = cc.audioEngine;

	var public = {};
	public.LOGTAG = "[Audio]";

	public.init = function ()
	{
		// web
		private.engine = cc.audioEngine;
		
		// JS: cc.audioEngine    ["end","features","__nativeObj","preloadMusic","stopMusic","stopAllEffects","getMusicVolume","resumeMusic","setMusicVolume","preloadEffect","isMusicPlaying","getEffectsVolume","willPlayMusic","pauseEffect","playEffect","rewindMusic","playMusic","resumeAllEffects","setEffectsVolume","stopEffect","pauseMusic","pauseAllEffects","unloadEffect","resumeEffect"]
		
		if (public.setting.load ())
		{

		}
		else
		{
			public.setting.musicVolume (private.music.volumn_default);
			public.setting.effectVolume (private.effect.volumn_default);
			public.setting.save ();
		}

		if(cc.sys.isNative)
		{
			for (var i = 0; i < AUDIO_EFFECTS.length; i++)
				private.engine.preloadEffect (AUDIO_EFFECTS [i]);

			for (var i = 0; i < AUDIO_MUSICS.length; i++)
				private.engine.preloadMusic (AUDIO_MUSICS [i]);
		}
	};

	public.music = function (musicPath, isLoop)
	{
		if (!musicPath || private.engine === null)
			return;

		private.music.path = musicPath;

		if (!private.music.on)
			return;
		
		if (!isLoop)
			isLoop = false;

		if (private.engine.isMusicPlaying())
			private.engine.stopMusic();

//      only one music can play
		private.engine.playMusic(musicPath, isLoop);

		cc.log ("AudioManager", "music", musicPath, isLoop, private.music.volume, private.music.on);
	};
	
	public.isMusicPlaying = function()
	{
		return private.engine.isMusicPlaying();
	};

	public.effect = function (effectPath)
	{
		if (!effectPath || private.engine === null)
			return;

		if (!private.effect.on)
			return;

		private.engine.playEffect(effectPath, false);

//		debug
//		var error = new Error ("AudioManager.effect");
//		var stack = error.stack;

		cc.log ("effect", effectPath, private.effect.volume, private.effect.on);
//		cc.log ("effect\n", stack);
	};

	public.setting = {};
	
	public.setting.save = function ()
	{
		var local = {
			music: private.music.volume,
			effect: private.effect.volume
		};
		cc.sys.localStorage.setItem ("Audio", JSON.stringify(local));
	};

	public.setting.load = function ()
	{
		var local = cc.sys.localStorage.getItem ("Audio");
		if (local)
		{
			local = JSON.parse (local);
			public.setting.musicVolume (local.music);
			public.setting.effectVolume (local.effect);
			return true;
		}

		return false;
	};

	//web
	//public.setting.isMusicOn = () => private.music.on;
	//public.setting.isEffectOn = () => private.effect.on;
	public.setting.isMusicOn = function() {return private.music.on;};
	public.setting.isEffectOn = function() {return private.effect.on;};

	public.setting.musicSwitch = function ()
	{
		var on = private.music.on;
		if (on)
		{
			public.setting.musicVolume (0);
			cc.log ("AudioManager", "music turn off");
		}
		else
		{
			public.setting.musicVolume (private.music.volumn_default);
			cc.log ("AudioManager", "music turn on");
		}
		return private.music.on;
	}

	public.setting.effectSwitch = function ()
	{
		var on = private.effect.on;
		if (on)
		{
			public.setting.effectVolume (0);
			cc.log ("AudioManager", "effect turn off");
		}
		else
		{
			public.setting.effectVolume (private.effect.volumn_default);
			cc.log ("AudioManager", "effect turn on");
		}
		return private.effect.on;
	}

	public.setting.musicVolume = function (volume)
	{
		if (volume < 0)
			volume = 0;
		else if (volume > 1)
			volume = 1;
		
		private.engine.setMusicVolume(volume);
		private.music.volume = volume;
		private.music.on = volume > 0;

		if (volume)
			public.music (private.music.path);
		else
			private.engine.stopMusic();

		public.setting.save ();
	};
	
	public.setting.effectVolume = function (volume)
	{
		if (volume < 0)
			volume = 0;
		else if (volume > 1)
			volume = 1;
		
		private.engine.setEffectsVolume(volume);
		private.effect.volume = volume;
		private.effect.on = volume > 0;
		
		if (volume == 0)
			private.engine.stopAllEffects();
		
		public.setting.save ();
	};

	var AudioManager = cc.Class.extend(public);
	return new AudioManager ();
}

var AudioManager = new AudioInit ();