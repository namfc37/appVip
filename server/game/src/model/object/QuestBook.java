package model.object;

import data.*;
import data.QuestBookInfo.LevelRatio;
import data.QuestBookInfo.Quest;
import data.QuestBookInfo.QuestAction;
import model.UserGame;
import util.Time;
import util.metric.MetricLog;
import util.serialize.Encoder;

import java.util.TreeMap;

import cmd.ErrorConst;

public class QuestBook extends Encoder.IObject implements KeyDefine
{
    private TreeMap<Integer, QuestBookInfo.Quest> quests;
    private int                                   dailyFinish = 0;

    private QuestBook ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static QuestBook create ()
    {
        QuestBook questBook = new QuestBook();
        questBook.quests = new TreeMap<>();

        return questBook;
    }

    public void update (UserGame userGame)
    {
        if (userGame.getLevel() < MiscInfo.QUEST_BOOK_USER_LEVEL())
            return;

        boolean isInit = quests.size() == 0;
        int num = MiscInfo.QUEST_BOOK_LIST_NUM() - quests.size();

        for (int i = 0; i < num; i++)
        {
            QuestBookInfo.Quest newQuest = ConstInfo.getQuestBookInfo().generate(this, userGame.getLevel(), isInit);

            if (newQuest == null)
                continue;

           // if (newQuest.SKIP_PRICE_NUM() < 0)
               // continue;

            Festival festival = userGame.getFestival();
            if (festival != null)
                newQuest.addEventReward(festival.collectEP(userGame, CmdDefine.QUEST_BOOK_ADD, newQuest.ACTION_ID()));

            Fishing fishing = userGame.getFishing();
            newQuest.addEventReward(fishing.collectEP(userGame, CmdDefine.QUEST_BOOK_ADD, newQuest.ACTION_ID()));

            quests.put(newQuest.ID(), newQuest);

            MetricLog.actionUser(userGame.userControl.country,
                                 "QUEST_BOOK_ADD",
                                 userGame.userControl.platformID,
                                 userGame.userControl.brief.getUserId(),
                                 userGame.userControl.brief.getUsername(),
                                 userGame.userControl.socialType,
                                 userGame.getLevel(),
                                 "",
                                 null,
                                 null,
                                 ErrorConst.SUCCESS,
                                 userGame.userControl.getCoin(),
                                 0,
                                 userGame.getGold(),
                                 0,
                                 newQuest.ID(),
                                 newQuest.ACTION(),
                                 newQuest.TARGET(),
                                 newQuest.REQUIRE(),
                                 newQuest.SKIP_PRICE_TYPE() + ":" + newQuest.SKIP_PRICE_NUM(),
                                 MetricLog.toString(newQuest.REWARD()),
                                 MetricLog.toString(newQuest.SPECIAL_REWARD())
                                );
        }
    }

    public void checkDailyReset (int lastLogin)
    {
        Quest dailyLoginQuest = null;
        for (Quest quest : quests.values())
        {
            if (quest.ACTION_ID() == 37)
            {
                dailyLoginQuest = quest;
                break;
            }
        }

        if (dailyLoginQuest == null || !dailyLoginQuest.isActive())
            return;

        int current = Time.getUnixTime();
        int offset = current - lastLogin;
        if (offset > Time.SECOND_IN_DAY)
            dailyLoginQuest.resetProgress();

        dailyLoginQuest.updateProgress(dailyLoginQuest.CURRENT() + 1);
    }

    public void finish (UserGame userGame, int questId)
    {
        if (!quests.containsKey(questId))
            return;

        quests.remove(questId);
        dailyFinish += 1;

        update(userGame);
    }

    public int dailyFinish ()
    {
        return dailyFinish;
    }

    public void resetDailyFinish ()
    {
        dailyFinish = 0;
    }

    public TreeMap<Integer, QuestBookInfo.Quest> getList ()
    {
        return quests;
    }

    public int getNextIndex ()
    {
        int next = -1;
        for (Integer id : quests.keySet())
            if (next < id)
                next = id;

        return next + 1;
    }

    public Quest getQuest (int questId)
    {
        if (!quests.containsKey(questId))
            return null;

        return quests.get(questId);
    }

    @Override
    public void putData (Encoder msg)
    {
        QuestBookInfo.Quest list[] = new QuestBookInfo.Quest[quests.size()];

        int i = 0;
        for (Integer id : quests.keySet())
        {
            QuestBookInfo.Quest quest = quests.get(id);
            list[i] = quest;
            i += 1;
        }

        msg.put(KEY_QUEST_BOOK, list);
    }

    public boolean contains (int questId)
    {
        return quests.containsKey(questId);
    }

    public boolean isActive (int questId)
    {
        return false;
    }

    public boolean isFinish (int questId)
    {
        return false;
    }

    public boolean checkPrice (String priceType, int priceNum)
    {
        return false;
    }

    public String gmAdd (UserGame game, String data)
    {
        if (data == null || data.isEmpty())
            return "";

        Festival festival = game.getFestival();
        int userLevel = game.getLevel();

        LevelRatio ratio = ConstInfo.getQuestBookInfo().getLevelRatio(userLevel);
        String[] list = data.split(",");
        String result = "";
        for (int i = 0; i < list.length; i++)
        {
            if (list[i].isEmpty())
                continue;

            String actionName = list[i];

            QuestAction action = ConstInfo.getQuestBookInfo().getAction(actionName);
            if (action == null)
                continue;

            Quest quest = action.generate(userLevel, this.getNextIndex(), ratio, -1, null);
            if (quest == null)
                continue;

            if (festival != null)
                quest.addEventReward(festival.collectEP(game, CmdDefine.QUEST_BOOK_ADD, quest.ACTION_ID()));

            Fishing fishing = game.getFishing();
            quest.addEventReward(fishing.collectEP(game, CmdDefine.QUEST_BOOK_ADD, quest.ACTION_ID()));

            this.quests.put(quest.ID(), quest);
            if (result.isEmpty())
                result = quest.ID() + ":" + quest.ACTION();
            else
                result += "," + quest.ID() + ":" + quest.ACTION();
        }

        return result;
    }

    public String gmRemove (String data)
    {
        if (data == null || data.isEmpty())
            return "";

        if (data.equalsIgnoreCase("all"))
        {
            quests.clear();
            return "all";
        }

        String[] list = data.split(",");
        String result = "";
        for (int i = 0; i < list.length; i++)
        {
            if (list[i].isEmpty())
                continue;

            String action = list[i];
            for (Integer id : quests.keySet())
            {
                Quest item = quests.get(id);
                if (item.ACTION().equalsIgnoreCase(action))
                {
                    Quest quest = quests.remove(id);
                    if (result.isEmpty())
                        result = quest.ID() + ":" + quest.ACTION();
                    else
                        result += "," + quest.ID() + ":" + quest.ACTION();

                    break;
                }
            }
        }

        return result;
    }

    public String gmChange (String data)
    {
        if (data == null || data.isEmpty())
            return "";

        String[] list = data.split(",");
        String result = "";
        for (int i = 0; i < list.length; i++)
        {
            if (list[i].isEmpty())
                continue;

            String[] cmd = list[i].split(":");
            if (cmd.length != 2)
                continue;

            String action = cmd[0];
            int current = Integer.valueOf(cmd[1]);
            for (Integer id : quests.keySet())
            {
                Quest item = quests.get(id);
                if (item.ACTION().equalsIgnoreCase(action))
                {
                    item.gmChangeProgress(current);
                    if (result.isEmpty())
                        result = item.ID() + ":" + item.ACTION() + ":" + item.CURRENT() + ":" + item.REQUIRE();
                    else
                        result += "," + item.ID() + ":" + item.ACTION() + ":" + item.CURRENT() + ":" + item.REQUIRE();
                    break;
                }
            }
        }

        return result;
    }
}
