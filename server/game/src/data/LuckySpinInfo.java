package data;

import java.util.Map;
import java.util.TreeMap;

public class LuckySpinInfo
{
    private int[][] RATE_PLANT;
    private int[][] RATE_PRODUCT;
    private int[][] RATE_MATERIAL;
    private int[][] RATE_DECOR;
    private int[][] RATE_POT;
    private int[][] RATE_GOLD;
    private int[][] RATE_COIN;
    private int[][] RATE_X2;

    private TreeMap<Integer, String[]> TREE_PLANT;
    private TreeMap<Integer, String[]> TREE_PRODUCT;
    private TreeMap<Integer, String[]> TREE_MATERIAL;
    private TreeMap<Integer, String[]> TREE_DECOR;
    private TreeMap<Integer, String[]> TREE_POT;
    private TreeMap<Integer, Integer>  TREE_GOLD;

    public int ratePlant (int group, int spin)
    {
        return RATE_PLANT[group][spin];
    }

    public int rateProduct (int group, int spin)
    {
        return RATE_PRODUCT[group][spin];
    }

    public int rateMaterial (int group, int spin)
    {
        return RATE_MATERIAL[group][spin];
    }

    public int rateDecor (int group, int spin)
    {
        return RATE_DECOR[group][spin];
    }

    public int ratePot (int group, int spin)
    {
        return RATE_POT[group][spin];
    }

    public int rateGold (int group, int spin)
    {
        return RATE_GOLD[group][spin];
    }

    public int rateCoin (int group, int spin)
    {
        return RATE_COIN[group][spin];
    }

    public int rateX2 (int group, int spin)
    {
        return RATE_X2[group][spin];
    }

    public String[] plant (int level)
    {
        return TREE_PLANT.floorEntry(level).getValue();
    }

    public String[] product (int level)
    {
        return TREE_PRODUCT.floorEntry(level).getValue();
    }

    public String[] material (int level)
    {
        return TREE_MATERIAL.floorEntry(level).getValue();
    }

    public String[] decor (int level)
    {
        Map.Entry<Integer, String[]> entry = TREE_DECOR.floorEntry(level);
        return entry == null ? null : entry.getValue();
    }

    public String[] pot (int level)
    {
        return TREE_POT.floorEntry(level).getValue();
    }

    public int gold (int level)
    {
        return TREE_GOLD.floorEntry(level).getValue();
    }

}
