package service.balance;

import extension.EnvConfig;
import service.udp.MsgWorkerInfo;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class Group
{
    private transient int                 id;
    private transient List<MsgWorkerInfo> simulate = new ArrayList<>();

    private Set<Integer>                             clientCode = new HashSet<>();
    private ConcurrentHashMap<String, MsgWorkerInfo> mapWorker  = new ConcurrentHashMap<>();

    public Group (int id)
    {
        this.id = id;
    }

    void addWorker (MsgWorkerInfo info)
    {
        if (info.cpuSystem < 0 || info.cpuSystem >= 100)
            info.weight = 0;
        else
            info.weight = (100 - info.cpuSystem) * info.numCore;
        mapWorker.put(info.privateHost, info);
    }

    MsgWorkerInfo chooseWorker (int code)
    {
        if (simulate == null)
            return null;

        MsgWorkerInfo info;

        synchronized (simulate)
        {
            int size = simulate.size();
            if (size == 0)
                return null;

            info = simulate.get(0);
            info.increaseConnection();

            if (size > 1)
            {
                int low = 1;
                int high = size - 1;
                int mid = 0;
                double midVal;
                double key = info.point;

                while (low <= high)
                {
                    mid = (low + high) >> 1;
                    midVal = simulate.get(mid).point;

                    if (midVal < key)
                        low = mid + 1;
                    else if (midVal > key)
                        high = mid - 1;
                    else
                        break;
                }
                if (mid != 0)
                    simulate.add(mid, simulate.remove(0));
            }
        }

        addClientCode(code);
        return info;
    }

    void resetSimulate ()
    {
        if (mapWorker.isEmpty())
        {
            simulate = null;
            return;
        }

        EnvConfig.BalanceInfo info = EnvConfig.getBalance();
        long curTime = System.currentTimeMillis();

        List<MsgWorkerInfo> newSimulate = new ArrayList<>();

        for (MsgWorkerInfo w : mapWorker.values())
        {
            if (w.isRunning)
            {
                if (w.weight > 0 && curTime - w.time <= info.getTimeout())
                    newSimulate.add(w);
                else
                    w.isRunning = false;
            }
        }

        Collections.shuffle(newSimulate);
        Collections.sort(newSimulate, Comparator.comparingDouble(o -> o.point));

        simulate = newSimulate;
    }

    public void addTableStatus (StringBuilder s)
    {
        for (MsgWorkerInfo w : mapWorker.values())
        {
            s.append("<tr >");
            s.append("<td >").append(w.privateHost).append("</td >");
            s.append("<td >").append(w.publicHost).append("</td >");
            s.append("<td >").append(w.service).append("</td >");
            s.append("<td >").append(w.group).append("</td >");
            s.append("<td >").append(w.isRunning ? 'x' : ' ').append("</td >");
            s.append("<td >").append(w.ccu).append("</td >");
            s.append("<td >").append(w.connection).append("</td >");
            s.append("<td >").append(w.cpuProcess).append("</td >");
            s.append("<td >").append(w.cpuSystem).append("</td >");
            s.append("<td >").append(w.memProcess).append("</td >");
            s.append("<td >").append(w.memFree).append("</td >");
            s.append("<td >").append(w.numException).append("</td >");
            s.append("<td >").append(w.privateShop).append("</td >");
            s.append("<td >").append(w.airship).append("</td >");
            s.append("<td >").append(w.friend).append("</td >");
            s.append("<td >").append(w.upTime).append("</td >");
            s.append("<td >").append(w.builtVersion).append("</td >");
            s.append("<td >").append(w.time / 1000).append("</td >");
            s.append("</tr >");
        }
    }

    private void addClientCode (int code)
    {
        if (clientCode.contains(code))
            return;
        synchronized (clientCode)
        {
            clientCode.add(code);
        }
    }
}
