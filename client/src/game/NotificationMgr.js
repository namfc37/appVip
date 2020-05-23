var NotifyManager = cc.Class.extend(
{
	LOGTAG: "[NotifyManager]",
	canShowNotify: false,
	ctor: function()
	{
	},

	onStart: function()
	{
		cc.log(this.LOGTAG, "onStart", g_MISCINFO.NOTIFY_MANAGER_ACTIVE);

		if (!g_MISCINFO.NOTIFY_MANAGER_ACTIVE)
			return;
		
		fr.platformWrapper.cancelAllNotification();
		this.canShowNotify = true;
	},

	onHide: function()
	{	
		cc.log(this.LOGTAG, "onHide", g_MISCINFO.NOTIFY_MANAGER_ACTIVE);

		if (!g_MISCINFO.NOTIFY_MANAGER_ACTIVE)
			return;
		if (!this.canShowNotify)
			return;
		this.canShowNotify = false;

		this.case_01_newbie_dont_comeback_after_1d ();
		this.case_02_user_dont_comeback_after_1d ();
		this.case_03_user_dont_comeback_after_3d ();
		this.case_04_user_dont_comeback_after_7d ();
		// this.case_05_tom_wakeup ();
		// this.case_06_event_begin ();
		// this.case_07_event_end ();
		// this.case_08_client_upgrade ();
		//this.case_09_daily_12h ();
		fr.platformWrapper.showNotify();
	},

	onShow: function()
	{
		cc.log(this.LOGTAG, "onShow", g_MISCINFO.NOTIFY_MANAGER_ACTIVE);

		if (!g_MISCINFO.NOTIFY_MANAGER_ACTIVE)
			return;		

		fr.platformWrapper.cancelAllNotification();
		this.canShowNotify = true;
	},

	addNotify: function(textId, time)
	{
		if (!g_MISCINFO.NOTIFY_MANAGER_ACTIVE)
			return;
			
		cc.log(this.LOGTAG, "addNotify", textId, time);

		var notify = {
			contentText: FWLocalization.text(textId),
			time: time.getTime(),
			sound:'default'
		};
		
		fr.platformWrapper.addNotify(notify);
	},

	case_01_newbie_dont_comeback_after_1d: function()
	{
		var minLv = 15;
		var maxLv = 30;
		if (!gv.mainUserData)
			return null;
		var userLv = gv.mainUserData.getLevel();
		if (minLv > userLv || userLv > maxLv)
			return null;
		
		var hour = 10;
		var offlineDay = 2;
		var messageId = "TXT_NOTIFY_CASE_01";
		
		var nextTime = new Date();
		nextTime.setDate (nextTime.getDate () + offlineDay);
		nextTime.setHours (hour, 0, 0, 0);
		// nextTime.setTime (nextTime.getTime() + 5000);
		this.addNotify (messageId, nextTime);
	},

	case_02_user_dont_comeback_after_1d: function()
	{
		var minLv = 30;
		if (!gv.mainUserData)
			return null;
		var userLv = gv.mainUserData.getLevel();
		if (minLv > userLv)
			return null;
		
		var hour = 10;
		var offlineDay = 2;
		var messageId = "TXT_NOTIFY_CASE_02";
		
		var nextTime = new Date();
		nextTime.setDate (nextTime.getDate () + offlineDay);
		nextTime.setHours (hour, 0, 0, 0);
		// nextTime.setTime (nextTime.getTime() + 30000);
		this.addNotify (messageId, nextTime);
	},

	case_03_user_dont_comeback_after_3d: function()
	{
		var hour = 10;
		var offlineDay = 4;
		var messageId = "TXT_NOTIFY_CASE_03";
		
		var nextTime = new Date();
		nextTime.setDate (nextTime.getDate () + offlineDay);
		nextTime.setHours (hour, 0, 0, 0);
		// nextTime.setTime (nextTime.getTime() + 30000);
		this.addNotify (messageId, nextTime);
	},

	case_04_user_dont_comeback_after_7d: function()
	{
		var hour = 10;
		var offlineDay = 8;
		var messageId = "TXT_NOTIFY_CASE_04";
		
		var nextTime = new Date();
		nextTime.setDate (nextTime.getDate () + offlineDay);
		nextTime.setHours (hour, 0, 0, 0);
		// nextTime.setTime (nextTime.getTime() + 30000);
		this.addNotify (messageId, nextTime);
	},

	case_05_tom_wakeup: function()
	{
		if (!gv || !gv.tomkid || !gv.tomkid.isUnlocked())
			return;

		var timeHireRemain = gv.tomkid.getHireTimeLeft() * 1000;
		var timeWakeup = gv.tomkid.getRestTimeLeft() * 1000;

		// cc.log ("NotifyManager", "case_05_tom_wakeup", "timeWakeup", timeWakeup, "timeHireRemain", timeHireRemain);
		if (timeHireRemain < timeWakeup)
		{
			// cc.log ("NotifyManager", "case_05_tom_wakeup", "timeWakeup > timeHireRemain");
			return;
		}

		if (timeWakeup === 0)
			return;

		var nextTime = new Date();
		// cc.log ("NotifyManager", "case_05_tom_wakeup", "time1", nextTime);
		nextTime.setTime (nextTime.getTime() + timeWakeup);
		// cc.log ("NotifyManager", "case_05_tom_wakeup", "time2", nextTime);
		
		var hour = nextTime.getHours();
		if (hour > 22 || hour < 9)
			return;
		
		var messageId = "TXT_NOTIFY_CASE_05";
		this.addNotify (messageId, nextTime);
	},

	case_06_event_begin: function()
	{
	},
	
	case_07_event_end: function()
	{
	},
	
	case_08_client_upgrade: function()
	{
	},
	
	case_09_daily_12h: function()
	{
		var hour = 12;
		var messageId = "TXT_NOTIFY_CASE_09";
		
		var nextTime = new Date();
		if (nextTime.getHours() >= hour)
			return;

		nextTime.setHours (hour, 0, 0, 0);
		this.addNotify (messageId, nextTime);
	},
});

gv.notificationMgr = new NotifyManager ();
gv.notificationMgr.onStart();