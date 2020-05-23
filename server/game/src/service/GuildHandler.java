package service;

import bitzero.server.extensions.data.DataCmd;
import cmd.BaseMessage;
import cmd.ErrorConst;
import cmd.receive.user.*;
import cmd.send.user.*;
import data.CmdDefine;
import data.CmdName;
import data.ConstInfo;
import data.ItemId;
import data.ItemType;
import data.MiscDefine;
import data.MiscInfo;
import data.SkipTimeInfo;
import model.UserGame;
import model.guild.DerbyMilestoneReward;
import model.mail.MailBox;
import model.mail.MailBox.Mail;
import model.object.UserGuild;
import payment.billing.PurchaseInfo;
import service.guild.GuildDerby;
import service.guild.GuildDerbyGroup;
import service.guild.GuildDonate;
import service.guild.GuildInfo;
import service.guild.GuildManager;
import service.guild.GuildMemberInfo;
import service.guild.cache.CacheGuildClient;
import service.guild.cache.CacheGuildInfo;
import service.guild.cache.CacheGuildServer;
import service.guild.cache.DerbyGroup;
import service.guild.cache.GuildDerbyTime;
import user.UserControl;
import util.Time;
import util.collection.MapItem;
import util.executor.GroupQueueExecutor;
import util.metric.MetricLog;
import util.serialize.Decoder;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class GuildHandler extends ClientRequestHandler
{
    public static final GuildHandler                instance = new GuildHandler();
    public static final GroupQueueExecutor<Integer> executor = new GroupQueueExecutor<>();

    @Override
    public void handleSystemCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception
    {

    }

    @Override
    public void handleUserCommand (String transactionId, UserControl userControl, UserControl.QueueCommand action) throws Exception
    {
        Decoder decoder = action.decoder;
        short cmd = action.cmd;
        switch (cmd)
        {
            case CmdDefine.GUILD_GET:
                get(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_GET_USER_INFO:
                getUserInfo(cmd, transactionId, userControl, decoder);
                break;
                
            case CmdDefine.GUILD_GET_MEMBERS:
                getMembers(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_GET_WAITING:
                getWaiting(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_CREATE:
                create(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_DISBAND:
                disband(cmd, transactionId, userControl, decoder);
                break;

//			case CmdDefine.GUILD_DISBAND_CANCEL:
//	        	disbandCancel(cmd, transactionId, userControl, dataCmd);
//			break;

            case CmdDefine.GUILD_GET_SUGGEST:
                suggest(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_SEARCH:
                search(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_SET_PRESIDENT:
                setPresident(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_SET_DEPUTY:
                setDeputy(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_SET_SETTING:
                setSetting(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_SEND_MAIL:
                sendMail(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_ACCEPT:
                memberAccept(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_REJECT:
                memberReject(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_INVITE:
                memberInvite(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_JOIN:
                memberJoin(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_KICK:
                memberKick(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_LEAVE:
                memberLeave(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_DONATE_GET:
                memberDonateGet(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_DONATE_START:
                memberDonateStart(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_DONATE:
                memberDonate(cmd, transactionId, userControl, decoder);
                break;

            case CmdDefine.GUILD_MEMBER_DONATE_END:
                memberDonateEnd(cmd, transactionId, userControl, decoder);
                break;
			
			case CmdDefine.GUILD_DERBY_GET:
	        	derbyGet(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_GET_GROUP:
	        	derbyGetGroup(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_GET_GROUP_GLOBAL:
	        	derbyGetGroupGlobal(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_GET:
	        	derbyTaskGet(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_ACCEPT:
	        	derbyTaskAccept(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_CANCEL:
	        	derbyTaskCancel(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_REMOVE:
				derbyTaskRemove(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_SKIP_COOLDOWN:
				derbyTaskSkipCooldown(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_TASK_UPDATE_PROCESS:
				derbyTaskUpdateProcess(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_REWARD_GET:
				derbyMilestoneRewardGet(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_REWARD_CLAIM:
				derbyMilestoneRewardClaim(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_REWARD_CHOOSE:
				derbyMilestoneRewardChoose(cmd, transactionId, userControl, decoder);
			break;
			
			case CmdDefine.GUILD_DERBY_REWARD_CHANGE:
				derbyMilestoneRewardChange(cmd, transactionId, userControl, decoder);
			break;
        }
    }

    private static void get (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        RequestGuildGet request = new RequestGuildGet(dataCmd);
        final int guildId = request.guildId;

        GuildInfo info = GuildManager.getGuildInfo(guildId);
        byte result = ErrorConst.SUCCESS;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (info == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            info.loadMembers();
            if (info.isMember(game.getUserId()))
            {
                info.loadDonates();

                if (info.isPresident(game.getUserId()) || info.isDeputy(game.getUserId()))
                {
                	info.loadWaiting();
                	info.updateGuests();
                }

                GuildMemberInfo me = info.getMember(game.getUserId());
                me.mergeFrom(game.toGuildMemberInfo());
                info.saveMember(me);

                boolean isLock = info.lockToUpdate();
                if (isLock)
                {
                    info.update();
                    info.save();

                    if (info.canDisband())
                        executor.add(guildId, () -> GuildHandler.systemGuildDisband(guildId, MiscDefine.GUILD_DISBAND_BY_NOT_ENOUGHT_MEMBER, MiscInfo.GUILD_LEAVE_PENALTY()));
                    else
                        executor.add(guildId, () -> GuildHandler.systemGuildMemberUpdate(guildId));
                   
                }
            }
        }

        BaseMessage msg = new ResponseGuildGet(cmd, result).packData(info);
        userControl.send(msg);
    }

    private static void getUserInfo (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	guild = userControl.loadUserGuild();
        	
        	if (guild == null)
        		result = ErrorConst.NULL_OBJECT;
        }
        
        BaseMessage msg = new ResponseGuildGetUserInfo(cmd, result).packData(guild);
        userControl.send(msg);
    }
    
    private static void getMembers (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();

        GuildInfo info = null;
        byte result = ErrorConst.SUCCESS;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if ((info = guild.getInfo()) == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!info.isMember(game.getUserId()))
            result = ErrorConst.GUILD_MEMBER;
        else if (!info.loadMembers())
            result = ErrorConst.FAIL;

        BaseMessage msg = new ResponseGuildGet(cmd, result).packData(info);
        userControl.send(msg);
    }

    private static void getWaiting (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();

        GuildInfo info = null;
        byte result = ErrorConst.SUCCESS;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if ((info = guild.getInfo()) == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!info.isPresident(game.getUserId()) || !info.isDeputy(game.getUserId()))
            result = ErrorConst.GUILD_PERMISSION;
        else if (!info.loadWaiting())
            result = ErrorConst.FAIL;

        BaseMessage msg = new ResponseGuildGet(cmd, result).packData(info);
        userControl.send(msg);
    }

    private static void create (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();

        RequestGuildCreate request = new RequestGuildCreate(dataCmd);
        int guildId = -1;
        String guildName = request.name;
        String guildAvatar = request.avatar;
        String guildDesc = request.desc;
        int guildType = request.type;
        int levelMin = request.levelMin < 1 ? MiscInfo.GUILD_CREATE_LEVEL_MIN() : request.levelMin;
        int levelMax = -1;//request.levelMax;
        int memberAppraisal = request.appraisal;
        int coinChange = 0;
        int goldChange = 0;

        int priceCoin = MiscInfo.GUILD_CREATE_REQUIRE_COIN();
        int appraisal = MiscInfo.GUILD_CREATE_REQUIRE_APPRAISAL();
        MapItem require = MiscInfo.GUILD_CREATE_REQUIRE_ITEMS();

        GuildInfo guildInfo = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (game.coin < priceCoin)
            result = ErrorConst.NOT_ENOUGH_COIN;
        else if (game.getAppraisal() < appraisal)
            result = ErrorConst.NOT_ENOUGH_APPRAISAL;
        else if (game.checkRequireItem(require) != ErrorConst.SUCCESS)
            result = ErrorConst.NOT_ENOUGH_ITEM;
        else
        {
            result = GuildInfo.createCheck(guildName, guildAvatar, guildDesc, guildType);

            if (result == ErrorConst.SUCCESS)
            {
                guildId = GuildManager.nextId();
                result = (guildId != -1) ? ErrorConst.SUCCESS : ErrorConst.GUILD_CANNOT_CREATE_ID;
            }

            if (result == ErrorConst.SUCCESS)
            {
                if (priceCoin > 0)
                    result = userControl.purchase(transactionId, priceCoin, PurchaseInfo.guildCreate());
            }

            if (result == ErrorConst.SUCCESS)
                if (require.size() > 0)
                    result = game.removeItem(cmd, transactionId, require);

            if (result == ErrorConst.SUCCESS)
            {
                guildInfo = GuildManager.create(guildId, guildName, guildAvatar, guildDesc, guildType, game.getUserId(), game.toGuildMemberInfo());
                guildInfo.changeSetting(game.getUserId(), guildDesc, guildAvatar, guildType, levelMin, levelMax, memberAppraisal);
                guildInfo.save();
                
                coinChange = -priceCoin;
                goldChange = -require.get(ItemId.GOLD);
                
                userControl.setUserGuild(guildInfo);
                userControl.markFlagSaveGame();
            }
            else
            {
                require = null;
            }
        }

        BaseMessage msg = new ResponseGuildCreate(cmd, result).packData(userControl.getCoin(), game.getGold(), game.getMapItemNum(require), guildInfo);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             require,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             goldChange,
                             guildInfo == null ? "" : guildInfo.getId(),
                             guildInfo == null ? "" : guildInfo.getName(),
                             guildInfo == null ? "" : guildInfo.getAvatar(),
                             guildInfo == null ? "" : guildInfo.getShortDesc()
                            );
    }

    private static void disband (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        int guildId = -1;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else
            {
                guildId = info.getId();
                result = info.disband(game.getUserId());
            }
        }

        BaseMessage msg = new ResponseGuildDisband(cmd, result).packData(game.getUserId(), info);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            info.sendMessage(msg, game.getUserId());
            info.save();

            final int removeId = guildId;
            executor.add(info.getId(), () -> GuildHandler.systemGuildDisband(removeId, MiscDefine.GUILD_DISBAND_BY_PRESIDENT, MiscInfo.GUILD_LEAVE_PENALTY()));
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             guildId
                            );
    }

    private static void disbandCancel (short cmd, String transactionId, UserControl userControl, DataCmd dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
                result = info.disbandCancel(game.getUserId());
        }

        BaseMessage msg = new ResponseGuildDisbandCancel(cmd, result).packData(game.getUserId(), info);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId()
                            );
    }

    private static void suggest (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        Collection<CacheGuildInfo> guilds = CacheGuildClient.getSuggestGuilds();
        if (guilds == null)
            result = ErrorConst.NULL_OBJECT;

        BaseMessage msg = new ResponseGuildSuggest(cmd, result).packData(guilds);
        userControl.send(msg);
    }

    private static void search (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;

        RequestGuildSearch request = new RequestGuildSearch(dataCmd);
        int guildId = request.guildId;
        GuildInfo info = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else
        {
            info = GuildManager.getGuildInfo(guildId);
            if (info == null)
                result = ErrorConst.INVALID_ID;
        }

        BaseMessage msg = new ResponseGuildSearch(cmd, result).packData(info);
        userControl.send(msg);
    }

    private static void setPresident (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildSetPresident request = new RequestGuildSetPresident(dataCmd);
        int guildId = -1;
        int targetUserId = request.targetId;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else
                guildId = guild.getId();

            if (result == ErrorConst.SUCCESS)
                result = info.transfer(game.getUserId(), targetUserId);

            if (result == ErrorConst.SUCCESS)
                info.save();
        }

        BaseMessage msg = new ResponseGuildSetPresident(cmd, result).packData(game.getUserId(), targetUserId);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            info.notifyGuild (game.getUserId(), MiscInfo.GUILD_MSG_PRESIDENT_SET() + "," + info.getMemberDisplayName(targetUserId));
            info.sendMessage(msg, game.getUserId());
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             targetUserId
                            );
    }

    private static void setDeputy (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildSetDeputy request = new RequestGuildSetDeputy(dataCmd);
        int targetUserId = request.targetId;
        int role = request.role;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
                result = info.member_setPermission(game.getUserId(), targetUserId, role);

            if (result == ErrorConst.SUCCESS)
                info.save();
        }

        BaseMessage msg = new ResponseGuildSetDeputy(cmd, result).packData(targetUserId, role);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
        	String str = (role == MiscDefine.GUILD_ROLE_MEMBER) ? MiscInfo.GUILD_MSG_DEPUTY_REMOVE() : MiscInfo.GUILD_MSG_DEPUTY_ADD();
        	info.notifyGuild (game.getUserId(), str + "," + info.getMemberDisplayName(targetUserId));
            info.sendMessage(msg, game.getUserId());
        }

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             targetUserId,
                             role
                            );
    }

    private static void setSetting (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildSetSetting request = new RequestGuildSetSetting(dataCmd);
        int guildId = -1;
        String desc = request.short_desc;
        String avatar = request.avatar;
        int status = request.type;
        int levelMin = request.levelMin;
        int levelMax = request.levelMax;
        int appraisal = request.appraisal;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
                result = info.changeSetting(game.getUserId(), desc, avatar, status, levelMin, levelMax, appraisal);

            if (result == ErrorConst.SUCCESS)
            {
                guildId = guild.getId();
                info.save();
            }
        }

        BaseMessage msg = new ResponseGuildSetSetting(cmd, result).packData(game.getUserId(), info);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            info.sendMessage(msg, game.getUserId());
            CacheGuildClient.updateGuildInfo(info);
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             status,
                             desc,
                             avatar
                            );
    }

    private static void sendMail (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildSendMail request = new RequestGuildSendMail(dataCmd);
        int guildId = -1;
        String mailContent = request.msg;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else if (!info.loadMembers())
                result = ErrorConst.FAIL;

            if (result == ErrorConst.SUCCESS)
            {
                guildId = guild.getId();
                result = info.sendMail(game.getUserId(), mailContent);
            }
        }

        BaseMessage msg = new ResponseGuildSendMail(cmd, result).packData();
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
            info.chatGuild(game.getUserId(), mailContent);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             mailContent
                            );
    }

    private static void memberAccept (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildMemberAccept request = new RequestGuildMemberAccept(dataCmd);
        int[] newMembers = request.memberIds;
        List<Integer> addMember = null;
        String addMemberName = "";
        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (newMembers == null || newMembers.length == 0)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
            {
                addMember = new ArrayList<Integer>();
                for (int id : newMembers)
                {
                    byte r = info.member_acceptJoin(game.getUserId(), id);
                    if (r == ErrorConst.SUCCESS)
                    {
                        if (addMember.size() > 0)
                        addMemberName += ", ";
                        addMemberName+= info.getMemberDisplayName(id);
                        addMember.add(id);
                    }
                }

                if (addMember.size() == 0)
                    result = ErrorConst.FAIL;
            }

            if (result == ErrorConst.SUCCESS)
			{			
				info.loadWaiting();
				info.loadMembers();
			}
        }

        BaseMessage msg = new ResponseGuildMemberAccept(cmd, result).packData(game.getUserId(), info);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
        	//String mems = MetricLog.listIntToString(addMember);
        	info.notifyGuild (game.getUserId(), MiscInfo.GUILD_MSG_MEMBER_JOIN() + "," + addMemberName);
        	msg = new ResponseGuildMemberAccept(cmd, result).packData();
            info.sendMessage(msg, game.getUserId());
            CacheGuildClient.updateGuildInfo(info);
        }

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             MetricLog.listIntToString(addMember)
                            );
    }

    private static void memberReject (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildMemberReject request = new RequestGuildMemberReject(dataCmd);
        int guildId = -1;
        int[] userIds = request.userIds;
        List<Integer> rejectIds = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (userIds == null || userIds.length == 0)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
            {
                rejectIds = new ArrayList<Integer>();
                for (int id : userIds)
                {
                    byte r = info.member_rejectJoin(game.getUserId(), id);
                    if (r == ErrorConst.SUCCESS)
                        rejectIds.add(id);
                }

                if (rejectIds.size() == 0)
                    result = ErrorConst.FAIL;
            }

            if (result == ErrorConst.SUCCESS)
                guildId = guild.getId();
        }

        BaseMessage msg = new ResponseGuildMemberReject(cmd, result).packData(game.getUserId(), rejectIds);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             MetricLog.listIntToString(rejectIds)
                            );
    }

    private static void memberInvite (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        int mailId = -1;

        RequestGuildMemberInvite request = new RequestGuildMemberInvite(dataCmd);
        int guildId = -1;
        int targetId = request.userId;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else
            {
                guildId = info.getId();
                int [] sendMailResult = info.member_sendInvite(game.getUserId(), targetId);
                if (sendMailResult != null)
                {
                    result = (byte) sendMailResult [0];
                    mailId = sendMailResult [1];
                }
                else
                	result = ErrorConst.FAIL;
            }
        }

        BaseMessage msg = new ResponseGuildMemberInvite(cmd, result).packData();
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             targetId,
                             mailId < 0 ? "" : mailId
                            );
    }

    private static void memberJoin (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();

        RequestGuildMemberJoin request = new RequestGuildMemberJoin(dataCmd);
        int guildId = request.guildId;
        int role = -1;
        int guildStatus = -1;
        GuildInfo info = GuildManager.getGuildInfo(guildId);
        GuildMemberInfo memberInfo = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild != null && guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (info == null)
            result = ErrorConst.INVALID_ID;
        else
        {
            memberInfo = game.toGuildMemberInfo();
            guildId = info.getId();

            boolean isGuest = info.isGuest(game.getUserId());
            if (!isGuest && guild.isGuildJoinPenaty())
            	result = ErrorConst.TIME_WAIT;
            
            if (result == ErrorConst.SUCCESS)
            	result = info.member_checkJoin(game.getLevel(), game.getAppraisal());
            
            if (result == ErrorConst.SUCCESS)
                result = info.member_requestJoin(game.getUserId(), memberInfo);

            if (result == ErrorConst.SUCCESS)
            {
                role = info.member_role(game.getUserId());
                guildStatus = info.getType();

                if (role == MiscDefine.GUILD_ROLE_PRESIDENT || role == MiscDefine.GUILD_ROLE_DEPUTY || role == MiscDefine.GUILD_ROLE_MEMBER)
                {
                    guild.join(guildId);
                    guild.setRole(role);
                    UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
                }
            }
            else
            {
                memberInfo = null;
            }
        }

        BaseMessage msg = new ResponseGuildMemberJoin(cmd, result).packData(role, guild);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
        	if (role == MiscDefine.GUILD_ROLE_MEMBER)
            {
                info.notifyGuild (game.getUserId(), MiscInfo.GUILD_MSG_MEMBER_JOIN() + "," + info.getMemberDisplayName(game.getUserId()));
            }
            msg = new ResponseGuildMemberJoin(cmd, result).packData(game.getUserId(), role, memberInfo);
            info.sendMessage(msg, game.getUserId());

            CacheGuildClient.updateGuildInfo(info);
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             guildStatus == -1 ? "" : guildStatus,
                             role == -1 ? "" : role
                            );
    }

    private static void memberKick (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;

        RequestGuildMemberKick request = new RequestGuildMemberKick(dataCmd);
        int[] memberIds = request.userIds;
        List<Integer> removeIds = null;
        GuildDerby guildDerby = guild.getDerbyInfo();
        int userId = game.getUserId();
        String removeNames = "";

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (memberIds == null || memberIds.length == 0)
            result = ErrorConst.INVALID_LENGTH;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else if (!info.loadMembers())
                result = ErrorConst.FAIL;

            if (result == ErrorConst.SUCCESS)
            {
                removeIds = new ArrayList<Integer>();
                for (int id : memberIds)
                {
                    if (removeIds.size() > 0)
                        removeNames += ", ";
                    removeNames += info.getMemberDisplayName(id);
                    byte r = info.member_kick(userId, id);
                    if (r != ErrorConst.SUCCESS)
                        continue;

                    removeIds.add(id);
                    systemDonateEnd(transactionId, info, id, true);
                    if (guildDerby != null) guildDerby.memberRemove(id);
                }

                if (removeIds.size() == 0)
                    result = ErrorConst.FAIL;
            }
			
            if (result == ErrorConst.SUCCESS)
	            info.save();
        }

        BaseMessage msg = new ResponseGuildMemberKick(cmd, result).packData(userId, removeIds);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
        	//String mems = MetricLog.listIntToString(removeIds);
        	info.notifyGuild (userId, MiscInfo.GUILD_MSG_MEMBER_LEAVE() + "," + removeNames);
        	
            info.sendMessage(msg, userId);
            CacheGuildClient.updateGuildInfo(info);
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             MetricLog.listIntToString(removeIds)
                            );
    }

    private static void memberLeave (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby guildDerby = guild.getDerbyInfo();
        int userId = game.getUserId();
        String userName = "";

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else if (info.isMember(userId))
            	result = ErrorConst.GUILD_MEMBER;
            else
            	userName = info.getMemberDisplayName(userId);

            if (result == ErrorConst.SUCCESS)
                result = info.member_leave(userId);

            if (guildDerby != null)
            	guildDerby.memberRemove(userId);

            if (result == ErrorConst.SUCCESS)
            {
                info.save();
                
                guild.leave(info.getId());
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);

                systemDonateEnd(transactionId, info, game.getUserId(), true);
            }
        }

        BaseMessage msg = new ResponseGuildMemberLeave(cmd, result).packData(userId);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            info.notifyGuild (game.getUserId(), MiscInfo.GUILD_MSG_MEMBER_LEAVE() + "," + userName);
            info.sendMessage(msg, userId);
            CacheGuildClient.updateGuildInfo(info);
        }

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId()
                            );
    }

    private static void memberDonateGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDonate donate = null;

        RequestGuildMemberDonateGet request = new RequestGuildMemberDonateGet(dataCmd);
        int memberId = request.targetId;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else if (info.isMember(game.getUserId()))
                result = ErrorConst.GUILD_MEMBER;
            else
                donate = info.getDonate(memberId);
        }

        ResponseGuildMemberDonateGet msg = new ResponseGuildMemberDonateGet(cmd, result).packData(donate);
        userControl.send(msg);

//        if (donate != null && donate.isExpire())
//        {
//        	if (memberId != game.getUserId())
//        		userControl = UserControl.get(memberId);
//        	
//        	GuildHandler.memberDonateEnd(CmdDefine.GUILD_MEMBER_DONATE_END, transactionId, userControl, null);
//        }
    }

    private static void memberDonateStart (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDonate donate = null;

        RequestGuildMemberDonateStart request = new RequestGuildMemberDonateStart(dataCmd);
        String itemId = request.itemId;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (guild.donateRemain() < 1)
            result = ErrorConst.LIMIT_DAY;
        else if (guild.donateNextTime() > Time.getUnixTime())
        	result = ErrorConst.TIME_WAIT;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
                result = info.member_donateStart(game.getUserId(), itemId);

            if (result == ErrorConst.SUCCESS)
            {
                donate = info.getDonate(game.getUserId());
                guild.setDonateActive(true);
                guild.consumeDonateRemain();
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
            }
        }

        BaseMessage msg = new ResponseGuildMemberDonateStart(cmd, result).packData(guild, donate);
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            msg = new ResponseGuildMemberDonateStart(cmd, result).packData(donate);
            info.sendMessage(msg, game.getUserId());
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             itemId,
                             guild == null ? "" : guild.donateRemain()
                            );
    }

    private static void memberDonate (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDonate donate = null;

        RequestGuildMemberDonate request = new RequestGuildMemberDonate(dataCmd);
        int guildId = -1;
        int targetId = request.memberId;
        MapItem remove = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else if (guild.donateItemRemain() < 1)
            result = ErrorConst.LIMIT_DAY;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;

            if (result == ErrorConst.SUCCESS)
            {
                guildId = info.getId();
                result = info.member_checkDonate(game.getUserId(), targetId);
            }

            if (result == ErrorConst.SUCCESS)
            {
                donate = info.getDonate(targetId);
                remove = new MapItem();
                remove.increase(donate.getItemId(), 1);

                result = game.removeItem(cmd, transactionId, remove);
            }

            if (result == ErrorConst.SUCCESS)
            {
                info.member_donate(game.getUserId(), targetId);

                guild.addDonateCount(1);
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);

                userControl.markFlagSaveGame();
            }
            else
                remove = null;
        }

        BaseMessage msg = new ResponseGuildMemberDonate(cmd, result).packData(guild == null ? -1 : guild.donateItemTotal(), donate, game.getMapItemNum(remove));
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
        {
            msg = new ResponseGuildMemberDonate(cmd, result).packData(game.getUserId(), donate);
            info.sendMessage(msg, game.getUserId());
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             remove,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             targetId,
                             guild == null ? "" : guild.donateItemTotal()
                            );
        
        if (result == ErrorConst.SUCCESS && info != null && donate.isDone ())
            systemDonateEnd(transactionId, info, targetId, true);
    }

    private static void memberDonateEnd (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        MailBox mailBox = userControl.loadAndUpdateMailBox();

        GuildInfo info = null;
        GuildDonate donate = null;
        MapItem receive = null;
        int mailId = -1;
        int total = 0;
        int[] sendMailResult = null;

        if (!MiscInfo.GUILD_ACTIVE())
            result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
            result = ErrorConst.LIMIT_LEVEL;
        else if (mailBox == null)
            result = ErrorConst.NULL_MAIL_BOX;
        else if (guild == null || !guild.isMember())
            result = ErrorConst.GUILD_MEMBER;
        else
        {
            info = guild.getInfo();
            if (info == null)
                result = ErrorConst.NULL_OBJECT;
            else if (!info.isMember(game.getUserId()))
                result = ErrorConst.GUILD_MEMBER;

            if (result == ErrorConst.SUCCESS)
            {
                donate = info.getDonate(game.getUserId());

                if (donate == null)
                    result = ErrorConst.NULL_ITEM_INFO;
                else if (donate.getStart() + MiscInfo.GUILD_DONATE_COOLDOWN() > Time.getUnixTime())
                    result = ErrorConst.INVALID_ACTION;
                else
                {
                    receive = donate.getItems();
                    total = donate.getTotal();
                }
            }

            if (total > 0)
            	sendMailResult = info.sendMailTo(MiscDefine.MAIL_GUILD_DONATE, game.getUserId(), MiscInfo.GUILD_DONATE_MAIL_TITLE(), MiscInfo.GUILD_DONATE_MAIL_DESC(), receive);
            else
            	sendMailResult = info.sendMailTo(MiscDefine.MAIL_GUILD_DONATE_FAIL, game.getUserId(), MiscInfo.GUILD_DONATE_FAIL_MAIL_DESC());

            if (sendMailResult != null)
            {
                result = (byte) sendMailResult [0];
                mailId = sendMailResult [1];
                
                if (result == ErrorConst.SUCCESS)
                {
                    info.removeDonate(game.getUserId());
                    guild.setDonateActive(false);
                    UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
                }
            }
			else
				result = ErrorConst.FAIL;
        }

        BaseMessage msg = new ResponseGuildMemberDonateEnd(cmd, result).packData(game.getUserId());
        userControl.send(msg);

        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             mailId
                            );
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//DERBY//ONLY//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private static void derbyGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
            derby = guild.getDerbyInfo();
            if (derby == null)
            	result = ErrorConst.NULL_OBJECT;
            else
            {
            	derby.loadMembers();
            	derby.loadTasks (true, true, true);
            }
            
        	if (derby != null && derby.isActive ())
        	{
        		byte lock = derby.lock ();
            	if (lock == ErrorConst.SUCCESS)
            	{
                    executor.add(guild.getId(), () -> GuildHandler.systemDerbyMemberUpdate(transactionId, guild.getId()));
            		if (derby.updateTasks ())
            		{
            			derby.updatePoint();
            			derby.save();
            		}
                    if (derby.getTimeStart() == GuildDerbyTime.BUG_200408_TIME_START)
                        derby.save();

            		derby.unlock();
            	}
            }
        }

        BaseMessage msg = new ResponseGuildDerbyGet(cmd, result).packData(derby, CacheGuildClient.getNextDerbyTimeValue());
        userControl.send(msg);
    }
    
    private static void derbyGetGroup (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;
        
        GuildDerbyGroup group = null;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
            derby = guild.getDerbyInfo();
            if (derby == null)
            	result = ErrorConst.NULL_OBJECT;
            else
            {
                String groupId = derby.getGroupId ();
            	if (groupId == null)
            		result = ErrorConst.GUILD_PERMISSION;
            	else
            		group = CacheGuildClient.getDerbyGroup(groupId);
            }
        }
        
        BaseMessage msg = new ResponseGuildDerbyGetGroup(cmd, result).packData(group);
        userControl.send(msg);
    }
    
    private static void derbyGetGroupGlobal (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        GuildDerbyGroup group = null;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	group = CacheGuildClient.getLeagueTop (MiscInfo.DERBY_LEAGUE_GLOBAL ());
        	if (group == null)
        		result = ErrorConst.NULL_OBJECT;
        }
        
        BaseMessage msg = new ResponseGuildDerbyGetGroup(cmd, result).packData(group);
        userControl.send(msg);
    }
    
    private static void derbyTaskGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
            derby = guild.getDerbyInfo();
            if (derby == null)
            	result = ErrorConst.NULL_OBJECT;
            else
            	derby.loadTasks (true, true, true);
        }

        BaseMessage msg = new ResponseGuildDerbyTaskGet(cmd, result).packData(derby);
        userControl.send(msg);
    }
    
    private static void derbyTaskAccept (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        byte resultPurchase = ErrorConst.FAIL;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        GuildDerby.Member member = null;
        GuildDerby.Task task = null;
        Collection<GuildDerby.Task> taskNew = null;
        boolean isLock = false;
        MapItem removeItem = null;
        int coinChange = 0;
        
        RequestGuildDerbyTaskAccept request = new RequestGuildDerbyTaskAccept(dataCmd);
        int taskId = request.taskId;
        int price = request.clientPrice;
        int coin = request.clientCoin;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	if (price > 0)
        	{
        		if (coin != game.coin)
        			result = ErrorConst.INVALID_COIN;
        		else if (price != MiscInfo.DERBY_MEMBER_TASK_EXTRA_PRICE())
        			result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
        		else if (price > game.coin)
                 	result = ErrorConst.NOT_ENOUGH_COIN;
        	}
        	
            if (result == ErrorConst.SUCCESS)
            {
            	info = guild.getInfo();
                derby = guild.getDerbyInfo();
                
                if (info == null || derby == null)
            	    result = ErrorConst.GUILD_MEMBER;
                else
                {
                	if (!derby.isActive())
                		result = ErrorConst.TIMEOUT;
                	
		            member = derby.loadMember(game.getUserId());
		            task = derby.loadTask(taskId);
                }
            }
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.lock ();
            	isLock = result == ErrorConst.SUCCESS;
            }
            
            if (result == ErrorConst.SUCCESS)
            	result = derby.taskAccept (taskId, game.getUserId(), game.getLevel(), price > 0);
            
            if (result == ErrorConst.SUCCESS)
            {
            	taskNew = derby.getTaskNews();
        		derby.save();
            	
            	if (price > 0)
	            	resultPurchase = userControl.purchase(transactionId, price, PurchaseInfo.derbyTaskExtra());
            }
            
            if (resultPurchase == ErrorConst.SUCCESS)
            {
            	removeItem = new MapItem (ItemId.COIN, price);
            	coinChange = -price;
            }
            
            if (isLock)
            	derby.unlock ();
        }

        BaseMessage msg = new ResponseGuildDerbyTaskAccept(cmd, result).packData(member, task, game.coin, taskNew);
        userControl.send(msg);
        
        if (result == ErrorConst.SUCCESS && info != null)
        {
            msg = new ResponseGuildDerbyTaskAccept(cmd, result).packData(member, task, taskNew);
            info.sendMessage(msg, game.getUserId());
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             taskId,
                             task == null ? "" : task.ACTION_ID(),
                             member == null ? "" : member.DAILY_TASK_ACCEPT(),
                             resultPurchase,
                             request.clientPrice > 0 ? request.clientPrice : "",
                             request.clientPrice > 0 ? request.clientCoin : ""
                            );
    }
    
    private static void derbyTaskCancel (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        GuildDerby.Task task = null;
        
        RequestGuildDerbyTaskCancel request = new RequestGuildDerbyTaskCancel(dataCmd);
        int taskId = request.taskId;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	info = guild.getInfo();
            derby = guild.getDerbyInfo();
            
            if (info == null || derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            else if (!derby.isActive())
                result = ErrorConst.TIMEOUT;
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.taskCancel(taskId, game.getUserId());
        		task = derby.getTaskOld(taskId);
            }
        }

        BaseMessage msg = new ResponseGuildDerbyTaskCancel(cmd, result).packData(task);
        userControl.send(msg);
        
        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             taskId,
                             task == null ? "" : task.ACTION_ID(),
                             task == null ? "" : task.TARGET (),
                             task == null ? "" : task.CURRENT (),
                             task == null ? "" : task.REQUIRE()
                             );
    }
    
    private static void derbyTaskRemove (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        GuildDerby.Task task = null;
        Collection<GuildDerby.Task> taskNew = null;
        boolean isLock = false;

        RequestGuildDerbyTaskRemove request = new RequestGuildDerbyTaskRemove(dataCmd);
        int taskId = request.taskId;
        
        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	info = guild.getInfo();
            derby = guild.getDerbyInfo();

            if (info == null || derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            else if (!derby.isActive())
            	result = ErrorConst.TIMEOUT;
            else if (!info.isPresident(game.getUserId()) && !info.isDeputy(game.getUserId()))
            	result = ErrorConst.GUILD_PERMISSION;
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.lock ();
            	isLock = result == ErrorConst.SUCCESS;
            }
            
            if (result == ErrorConst.SUCCESS)
            	result = derby.taskRemove(taskId);
            
            if (result == ErrorConst.SUCCESS)
            {
        		task = derby.getTaskOld(taskId);
        		taskNew = derby.getTaskNews();
        		derby.save();
            }
            
            if (isLock)
            	derby.unlock ();
        }

        BaseMessage msg = new ResponseGuildDerbyTaskRemove(cmd, result).packData(task, taskNew);
        userControl.send(msg);
        
        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             taskId,
                             task == null ? "" : task.ACTION_ID(),
                             task == null ? "" : task.TARGET (),
                             task == null ? "" : task.REQUIRE()
                             );
    }
    
    private static void derbyTaskSkipCooldown (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        byte resultPurchase = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        GuildDerby.Task task = null;
        boolean isLock = false;
        MapItem removeItem = null;
        int coinChange = 0;

        RequestGuildDerbyTaskSkipCooldown request = new RequestGuildDerbyTaskSkipCooldown(dataCmd);
        int taskId = request.taskId;
        int price = request.price;
        int coin = request.coin;
        int checkPrice = -1;
        int timeSkip = -1;
        
        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else if (coin != game.coin)
    		result = ErrorConst.INVALID_COIN;
        else
        {
        	info = guild.getInfo();
            derby = guild.getDerbyInfo();
            
            if (info == null || derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            else if (!derby.isActive())
            	result = ErrorConst.TIMEOUT;
            else
            {
            	task = derby.loadTask(taskId);
            	if (task == null)
            	    result = ErrorConst.NULL_SLOT;
            	else
            		task.update();
            }
            
            if (result == ErrorConst.SUCCESS)
            {
            	int cooldown = task.COOLDOWN();
            	if (cooldown < 0)
            		result = ErrorConst.INVALID_ACTION;
            	else
            	{
                    timeSkip = task.START() - Time.getUnixTime();
                    SkipTimeInfo skipTimeInfo = ConstInfo.getSkipTimeInfo(ItemType.DERBYTASK, cooldown);
                    checkPrice = skipTimeInfo.calcPrice(timeSkip);	
            	}
            	
            	if (checkPrice != price)
            	    result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
	    		else if (checkPrice > game.coin)
	             	result = ErrorConst.NOT_ENOUGH_COIN;
            }
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.lock ();
            	isLock = result == ErrorConst.SUCCESS;
            }
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.taskSkipCooldown(taskId);
        		task = derby.getTask(taskId);
        		
        		resultPurchase = userControl.purchase(transactionId, checkPrice, PurchaseInfo.skipTime(cmd, timeSkip));
        		if (resultPurchase == ErrorConst.SUCCESS)
        		{
                    userControl.markFlagSaveGame();
                    removeItem = new MapItem (ItemId.COIN, checkPrice);
                    coinChange = -checkPrice;
        		}
            }

            if (result == ErrorConst.SUCCESS)
            	derby.save();
            
            if (isLock)
            	derby.unlock ();
        }

        BaseMessage msg = new ResponseGuildDerbyTaskSkipCooldown(cmd, result).packData(task, game.coin);
        userControl.send(msg);
        
        if (result == ErrorConst.SUCCESS && info != null)
        {
        	msg = new ResponseGuildDerbyTaskSkipCooldown(cmd, result).packData(task);
        	info.sendMessage(msg, game.getUserId());
        }
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             removeItem,
                             null,
                             result,
                             userControl.getCoin(),
                             coinChange,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             taskId,
                             task == null ? "" : task.ACTION_ID(),
                             resultPurchase,
                             request.coin,
                             request.price,
                             checkPrice, 
                             timeSkip
                            );
    }
    
    private static void derbyTaskUpdateProcess (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        GuildDerby.Task task = null;
        
        RequestGuildDerbyTaskUpdateProcess request = new RequestGuildDerbyTaskUpdateProcess(dataCmd);
        int taskId = request.taskId;
        int current = request.current;

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	info = guild.getInfo();
            derby = guild.getDerbyInfo();
            
            if (info == null || derby == null || derby.loadMember(game.getUserId()) == null)
        	    result = ErrorConst.GUILD_MEMBER;
            else if (!derby.isActive())
            	result = ErrorConst.TIMEOUT;
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = derby.taskUpdate(taskId, game.getUserId(), current);
            	
            	task = derby.getTaskDoing(taskId);
            	if (task == null)
            		task = derby.getTaskOld(taskId);
            }
            
            if (result == ErrorConst.SUCCESS)
            	derby.save();
        }

        BaseMessage msg = new ResponseGuildDerbyTaskUpdateProcess(cmd, result).packData(task);
        userControl.send(msg);
        
        if (result == ErrorConst.SUCCESS && info != null)
            info.sendMessage(msg, game.getUserId());

        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             taskId,
                             task == null ? "" : task.ACTION_ID(),
                             task == null ? "" : task.TARGET (),
                             task == null ? "" : task.CURRENT (),
                             task == null ? "" : task.REQUIRE()
                             );
    }

    private static void derbyMilestoneRewardGet (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;
        DerbyMilestoneReward rewards = null;
        int curTime = Time.getUnixTime();

        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
            derby = guild.getDerbyInfo();
            boolean isInRewardTime = derby.getTimeEnd() <= curTime && curTime <= derby.getTimeReward();
            if (derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            
            if (result == ErrorConst.SUCCESS)
            {
            	rewards = guild.getMileStoneReward ();
            	if (rewards == null)
            	{
                    rewards = guild.initMilestoneRewardByLeagueID (derby.getTimeReward(), derby.getLeague());
            		//rewards = guild.initMileStoneReward (derby.getTimeReward(), derby.getMilestone());

            		if (rewards == null)
            			result = ErrorConst.NULL_OBJECT;		
            	}
            	else
            		rewards.updateByLeagueId(derby.getTimeReward(), derby.getLeague());

                //update rewards (remove reward if not enough derbypoint)
                if (rewards.getMilestone() > derby.getMilestone() && isInRewardTime)
                    rewards.updateBeforeClaim(derby.getMilestone());
                if (derby.getMemberDoneTaskNum(game.getUserId()) < 1 && isInRewardTime)
                    rewards.clearReward();
            }
            
            if (result == ErrorConst.SUCCESS)
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
        }

        BaseMessage msg = new ResponseGuildDerbyRewardGet(cmd, result).packData(rewards);
        userControl.send(msg);
    }

    private static void derbyMilestoneRewardClaim (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildInfo info = null;
        GuildDerby derby = null;
        DerbyMilestoneReward rewards = null;
        MapItem receive = null;
        int mailId = -1;
        int guildId = -1;

        int curTime = Time.getUnixTime();
        RequestGuildDerbyMilestoneRewardClaim request = new RequestGuildDerbyMilestoneRewardClaim(dataCmd);
        int[] rewardIds = request.rewardId;
        
        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
        	info = guild.getInfo();
            derby = guild.getDerbyInfo();
            boolean isInRewardTime = derby.getTimeEnd() <= curTime && curTime <= derby.getTimeReward();
            if (info == null || derby == null)
        	    result = ErrorConst.INVALID_GUILD_ID;
            else if (rewardIds == null)
                result = ErrorConst.NULL_OBJECT;
            if (result == ErrorConst.SUCCESS)
            {
            	rewards = guild.getMileStoneReward ();
            	
            	if (rewards == null)
            		result = ErrorConst.NULL_OBJECT;
            	else if (rewards.isExpire ())
            		result = ErrorConst.EXPIRED;
            	else if (rewards.isClaim())
            		result = ErrorConst.INVALID_STATUS;
                else if (!isInRewardTime)
                    result = ErrorConst.INVALID_ACTION;
            	else
            		result = rewards.setChooseIds(rewardIds);
            }
            
            if (result == ErrorConst.SUCCESS)
            {
                if (rewards.getMilestone() > derby.getMilestone())
                    rewards.updateBeforeClaim(derby.getMilestone());

                if (derby.getMemberDoneTaskNum(game.getUserId()) < 1)
                    rewards.clearReward();

        		receive = rewards.getRewards ();
        		if (receive == null)
            		result = ErrorConst.INVALID_LENGTH;
            }
            
            if (result == ErrorConst.SUCCESS)
            {
                int[] sendMailResult = info.sendMailTo(MiscDefine.MAIL_GUILD_DERBY_REWARD, game.getUserId(), MiscInfo.DERBY_MEMBER_REWARD_MAIL_TITLE(), MiscInfo.DERBY_MEMBER_REWARD_MAIL_DESC(), receive);
            	result = (byte) sendMailResult [0]; 
            	mailId = sendMailResult [1];
            	
            	if (result == ErrorConst.SUCCESS)
            	{
            		rewards.claimCheck();
                    UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
            	}
            }
        }

        BaseMessage msg = new ResponseGuildDerbyRewardClaim(cmd, result).packData();
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             info == null ? "" : info.getId(),
                             derby == null ? "" : derby.getLeague(),
                             derby == null ? "" : derby.getGroupId(),
                             derby == null ? "" : derby.getMilestone(),
                             MetricLog.toString (rewardIds),
                             mailId
                            );
    }

    private static void derbyMilestoneRewardChange (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;
        DerbyMilestoneReward rewards = null;
        String removeItem = "";

        RequestGuildDerbyMilestoneRewardChange request = new RequestGuildDerbyMilestoneRewardChange(dataCmd);
        int coin = request.clientCoin;
        int price = request.clientPrice;
        int[] rewardIds = request.rewardId;
        
        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else if (coin != game.coin)
			result = ErrorConst.INVALID_COIN;
		else if (price != MiscInfo.DERBY_MEMBER_REWARD_CHANGE_PRICE())
			result = ErrorConst.CLIENT_PRICE_NOT_MATCH;
		else if (price > game.coin)
         	result = ErrorConst.NOT_ENOUGH_COIN;
        else
        {
            derby = guild.getDerbyInfo();
            
            if (derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            
            if (result == ErrorConst.SUCCESS)
            {
            	rewards = guild.getMileStoneReward ();
            	if (rewards == null)
            		result = ErrorConst.NULL_OBJECT;
            	else if (rewards.isExpire ())
            		result = ErrorConst.EXPIRED;
            	else if (rewards.isClaim())
            		result = ErrorConst.INVALID_STATUS;
            	else if (rewardIds != null && rewardIds.length > 0)
            		result = rewards.setChooseIds(rewardIds);
            	
            	if (result == ErrorConst.SUCCESS)
            		result = rewards.change ();
            }
            
            if (result == ErrorConst.SUCCESS)
            {
            	result = userControl.purchase(transactionId, price, PurchaseInfo.derbyTaskExtra());
	            if (result == ErrorConst.SUCCESS)
	    		{
	                userControl.markFlagSaveGame();
	                removeItem = MetricLog.toString(ItemId.COIN, price);
	    		}
            }
            
            if (result == ErrorConst.SUCCESS)
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
        }

        BaseMessage msg = new ResponseGuildDerbyRewardChange(cmd, result).packData(rewards, game.coin);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             derby == null ? "" : derby.getGuildId(),
                             derby == null ? "" : derby.getLeague(),
                             derby == null ? "" : derby.getGroupId(),
                             derby == null ? "" : derby.getMilestone(),
                             MetricLog.toString(rewardIds),
                             rewards == null ? "" : MetricLog.toString(rewards.getChooseIds ()),
                             price,
                             coin, 
                             game.coin
                            );
    }
    
    private static void derbyMilestoneRewardChoose (short cmd, String transactionId, UserControl userControl, Decoder dataCmd)
    {
        byte result = ErrorConst.SUCCESS;
        UserGame game = userControl.game;
        UserGuild guild = userControl.loadUserGuild();
        GuildDerby derby = null;
        DerbyMilestoneReward rewards = null;

        RequestGuildDerbyMilestoneRewardChoose request = new RequestGuildDerbyMilestoneRewardChoose(dataCmd);
        int[] rewardId = request.rewardId;
        
        if (!MiscInfo.GUILD_ACTIVE() || !MiscInfo.DERBY_ACTIVE())
        	result = ErrorConst.NOT_ACTIVE;
        else if (MiscInfo.GUILD_USER_LEVEL() > game.getLevel())
        	result = ErrorConst.LIMIT_LEVEL;
        else
        {
            derby = guild.getDerbyInfo();
            
            if (derby == null)
        	    result = ErrorConst.GUILD_MEMBER;
            else if (rewardId == null)
                result = ErrorConst.NULL_OBJECT;
            if (result == ErrorConst.SUCCESS)
            {
            	rewards = guild.getMileStoneReward ();
            	if (rewards == null)
            		result = ErrorConst.NULL_OBJECT;
            	else if (rewards.isExpire ())
            		result = ErrorConst.EXPIRED;
            	else if (rewards.isClaim())
            		result = ErrorConst.INVALID_STATUS;
            	else
            		result = rewards.setChooseIds (rewardId);
            }
            
            if (result == ErrorConst.SUCCESS)
                UserGuild.set(userControl.brief.getBucketId(), userControl.userId, guild);
        }

        BaseMessage msg = new ResponseGuildDerbyRewardChoose(cmd, result).packData(rewards);
        userControl.send(msg);
        
        MetricLog.actionUser(userControl.country,
                             cmd,
                             userControl.platformID,
                             userControl.brief.getUserId(),
                             userControl.brief.getUsername(),
                             userControl.socialType,
                             userControl.game.getLevel(),
                             transactionId,
                             null,
                             null,
                             result,
                             userControl.getCoin(),
                             0,
                             game.getGold(),
                             0,
                             derby == null ? "" : derby.getGuildId(),
                             derby == null ? "" : derby.getLeague(),
                             derby == null ? "" : derby.getGroupId(),
                             derby == null ? "" : derby.getMilestone(),
                             rewardId,
                             rewards == null ? "" : MetricLog.toString(rewards.getChooseIds ())
                            );
    }
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY//SYSTEM//ONLY////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private static void systemGuildDisband (int guildId, byte disbandType, int timePenalty)
    {
        byte result = ErrorConst.SUCCESS;
        short cmd = CmdDefine.GUILD_SYSTEM_DISBAND;
        String transactionID = "";
        GuildInfo info = GuildManager.getGuildInfo(guildId);
        
        if (info == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
        	try
        	{
        		result = info.destroy(disbandType, timePenalty);
        	}
        	catch (Exception e)
        	{
        		MetricLog.exception(e,
        							CmdName.get(cmd),
	                                guildId,
	                                disbandType
	                                );
        		result = ErrorConst.EXCEPTION;
        	}
        }

        if (info != null)
        {
        	info.unlockUpdate();

            CacheGuildClient.deleteGuildInfo(info.getId());

            BaseMessage msg = new ResponseGuildDisband(cmd, result).packData(-1, null);
            info.sendMessage(msg);
        }
        
        MetricLog.actionSystem(CmdName.get(cmd),
                               transactionID,
                               result,
                               guildId,
                               disbandType
                               );
    }

    private static void systemGuildMemberUpdate (final int guildId)
    {
        byte result = ErrorConst.SUCCESS;
        short cmd = CmdDefine.GUILD_SYSTEM_MEMBER_UPDATE;
        String transactionID = "";
        GuildInfo info = GuildManager.getGuildInfo(guildId);
        List<Integer> removeSuccessIds = null;
        List<Integer> removeIds = null;
        List<Integer> removeResult = null;
        Integer presidentId = null;

        if (info == null)
            result = ErrorConst.NULL_OBJECT;
        else if (!info.isLock())
            result = ErrorConst.INIT;
        else
        {
        	info.loadMembers();
            info.loadDonates();

            Set<Integer> temp = info.member_removeOffline();
            removeSuccessIds = new ArrayList<Integer>();
            removeIds = new ArrayList<Integer>();
            removeResult = new ArrayList<Integer>();
            for (int memberId : temp)
            {
                int kickResult = info.member_kickAuto(memberId, MiscDefine.GUILD_DISBAND_NONE, MiscInfo.GUILD_KICK_PENALTY());
                removeIds.add(memberId);
                removeResult.add(kickResult);
                
                if (kickResult == ErrorConst.SUCCESS)
                {
                	removeSuccessIds.add(memberId);
                	GuildHandler.systemDonateEnd(transactionID, info, memberId, false);
                }
            }

            presidentId = info.getPresidentId();
            if (presidentId != null && presidentId.intValue() < 0)
            {
                info.transferAuto();
                presidentId = info.getPresidentId();
            }
        }

        if (info != null)
            info.unlockUpdate();

        if (removeIds == null || removeIds.isEmpty())
            return;
        
        if (!removeSuccessIds.isEmpty())
        {
        	final int [] rids = new int [removeSuccessIds.size()];
        	for (int i = 0; i < removeSuccessIds.size(); i++)
        		rids [i] = removeSuccessIds.get(i);
        	
        	executor.add(guildId, () -> GuildHandler.systemDerbyMemberUpdate(transactionID, guildId, rids));
        }

        if (result == ErrorConst.SUCCESS && info != null)
        {
            info.setTimeUpdate(Time.getUnixTime() + Time.SECOND_IN_MINUTE * 5);
            info.save();

            BaseMessage msg = new ResponseGuildRemoveMemberOffline(cmd, result).packData(removeIds);
            info.sendMessage(msg);

            CacheGuildClient.updateGuildInfo(info);
        }

        MetricLog.actionSystem(CmdName.get(cmd),
                               transactionID,
                               result,
                               guildId,
                               presidentId,
                               MetricLog.listIntToString(removeIds),
                               MetricLog.listIntToString(removeResult)
                              );
    }

    private static void systemDonateEnd (String transactionID, GuildInfo info, int memberId, boolean isSendMail)
    {
        short cmd = CmdDefine.GUILD_MEMBER_DONATE_END;
        byte result = ErrorConst.SUCCESS;
        int[] sendMailResult = null;

        GuildDonate donate = null;
        MapItem receive = null;

        if (info == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
            donate = info.getDonate(memberId);

            if (donate == null)
                result = ErrorConst.NULL_ITEM_INFO;
            else
            {
                receive = donate.getItems();

                if (isSendMail)
                {
                	if (donate.getTotal() > 0)
	                    sendMailResult = info.sendMailTo(MiscDefine.MAIL_GUILD_DONATE, memberId, MiscInfo.GUILD_DONATE_MAIL_TITLE(), MiscInfo.GUILD_DONATE_MAIL_DESC(), receive);
                	else
                		sendMailResult = info.sendMailTo(MiscDefine.MAIL_GUILD_DONATE_FAIL, memberId, MiscInfo.GUILD_DONATE_FAIL_MAIL_DESC());
                }
            }

            if (result == ErrorConst.SUCCESS)
            {
            	info.removeDonate(memberId);
            	info.changeDonate(memberId, false);
            }
        }

        if (result == ErrorConst.SUCCESS && info != null)
        {
            BaseMessage msg = new ResponseGuildMemberDonateEnd(cmd, result).packData(memberId);
            info.sendMessage(msg);
        }

        MetricLog.actionSystem(CmdName.get(cmd),
                               transactionID,
                               result,
                               info == null ? -1 : info.getId(),
                               memberId,
                               MetricLog.toString(receive),
                               isSendMail,
                               sendMailResult == null ? "" : sendMailResult [0],
                               sendMailResult == null ? "" : sendMailResult [1]
                               );
    }
	
    public static void systemCheckAndDisband (Set<Integer> removeIds)
    {
    	int current = Time.getUnixTime();
    	for (int id : removeIds)
    	{
    		final int guildId = id;
            GuildInfo info = GuildManager.getGuildInfo(guildId);
            if (info == null || info.getTimeExpire() > current)
            	continue;
            
            info.isLock();
            int status = info.getStatus();
            byte temp = MiscDefine.GUILD_DISBAND_BY_DONT_ACTIVE;
            if (status == MiscDefine.GUILD_STATUS_WARNING)
				temp = MiscDefine.GUILD_DISBAND_BY_NOT_ENOUGHT_MEMBER;
            
            final byte disbandType = temp;
            executor.add(guildId, () -> GuildHandler.systemGuildDisband(guildId, disbandType, MiscInfo.GUILD_LEAVE_PENALTY()));
    	}
	}
    
    public static void systemDerbyMemberUpdate (final String transactionID, final int guildId, final int ... memberIds)
    {
        byte result = ErrorConst.SUCCESS;
        short cmd = CmdDefine.GUILD_DERBY_SYSTEM_MEMBER_UPDATE;
        GuildInfo info = GuildManager.getGuildInfo (guildId);
        GuildDerby derby = GuildManager.getGuildDerbyInfo (guildId);
        Set<Integer> removeIds = null;
        boolean isLock = false;
        boolean isChange = false;
        
        if (derby == null)
        	result = ErrorConst.NULL_OBJECT;
        	
        if (result == ErrorConst.SUCCESS)
        	result = derby.lock();
        else
        	return;
        
        if (result == ErrorConst.SUCCESS)
        {
        	isLock = true;
        	isChange = derby.update(info);
        	removeIds = derby.getMemberRemoved ();
        }
        else
        {
        	executor.add(guildId, () -> GuildHandler.systemDerbyMemberUpdate(transactionID, guildId, memberIds));
        	return;
        }

        if (isChange)
        	derby.save ();
        
    	if (isLock)
    		derby.unlock();
    	
        MetricLog.actionSystem(CmdName.get(cmd),
                               transactionID,
                               result,
                               guildId,
                               MetricLog.setIntToString(removeIds)
                               );
	}
    
    private static void systemGuildDerbyRemove (int guildId)
    {
        byte result = ErrorConst.SUCCESS;
        short cmd = CmdDefine.GUILD_SYSTEM_DISBAND;
        String transactionID = "";
        GuildDerby derby = GuildManager.getGuildDerbyInfo(guildId);

        if (derby == null)
            result = ErrorConst.NULL_OBJECT;
        else
        {
        	try
        	{
        		result = derby.destroy();
        	}
        	catch (Exception e)
        	{
        		result = ErrorConst.EXCEPTION;
        	}
        }

        MetricLog.actionSystem(CmdName.get(cmd),
                               transactionID,
                               result,
                               guildId
                               );
    }
}