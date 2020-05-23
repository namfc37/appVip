package model.object;

import data.AchievementInfo;
import data.KeyDefine;
import util.serialize.Encoder;

import java.util.HashMap;

public class Achievement extends Encoder.IObject implements KeyDefine
{
    private HashMap<Integer, Task> tasks;
    private int                    trophy;
    private int                    reward;

    private Achievement ()
    {
        //DO NOT ADD CODE IN CONSTRUCTOR
    }

    public static Achievement create ()
    {
        Achievement o = new Achievement();
        o.tasks = new HashMap<>();
        return o;
    }

    @Override
    public void putData (Encoder msg)
    {
        msg.put(ACHIEVEMENT_TASKS, tasks.values());
        msg.put(ACHIEVEMENT_TROPHY, trophy);
        msg.put(ACHIEVEMENT_REWARD, reward);
    }

    public static class Task extends Encoder.IObject implements KeyDefine
    {
        private int id;
        private int level;
        private int point;

        @Override
        public void putData (Encoder msg)
        {
            msg.put(ACHIEVEMENT_TASK_ID, id);
            msg.put(ACHIEVEMENT_TASK_LEVEL, level);
            msg.put(ACHIEVEMENT_TASK_POINT, point);
        }

        public boolean setPoint (int point)
        {
            if (point > 0 && point > this.point)
            {
                this.point = point;
                return true;
            }
            return false;
        }

        public int getPoint ()
        {
            return point;
        }

        public int getLevel ()
        {
            return level;
        }

        public void finish ()
        {
            level++;
        }
    }

    public Task getTask (int id)
    {
        Task t = tasks.get(id);
        if (t == null && id >= 0 && id < AchievementInfo.numTask())
        {
            t = new Task();
            t.id = id;
            tasks.put(id, t);
        }
        return t;
    }

    public int getTrophy ()
    {
        return trophy;
    }

    public void addTrophy (int value)
    {
        trophy += value;
    }

    public int getReward ()
    {
        return reward;
    }

    public void setReward (int reward)
    {
        this.reward = reward;
    }
}
