package data;

import cmd.ErrorConst;
import util.collection.MapItem;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

public class BlacksmithInfo
{
    private Map<String, Recipe>        RECIPES;
    private Map<String, List<Integer>> MATERIAL_POT_RATE;
    private Map<String, Integer>       BONUS_RATE_VIOLET_GRASS;
    private Map<String, Integer>       GLOVES_RATE;

    public void init ()
    {
        for (Recipe r : this.RECIPES.values())
            r.init();

        this.RECIPES = Collections.unmodifiableMap(this.RECIPES);
        this.MATERIAL_POT_RATE = Collections.unmodifiableMap(this.MATERIAL_POT_RATE);
        this.BONUS_RATE_VIOLET_GRASS = Collections.unmodifiableMap(this.BONUS_RATE_VIOLET_GRASS);
        this.GLOVES_RATE = Collections.unmodifiableMap(this.GLOVES_RATE);
    }

    public Recipe RECIPE (String potId)
    {
        return this.RECIPES.get(potId);
    }

    public float MATERIAL_POT_RATE (String targetPotId, String materialPotId)
    {
        Recipe recipe = RECIPE(targetPotId);
        if (recipe == null)
            return 0;

        List<Integer> rates = MATERIAL_POT_RATE.get(materialPotId);
        if (rates == null || rates.size() == 0)
            return 0;

        Integer rate = rates.get(recipe.SPECIAL_SET());
        if (rate == null)
            return 0;

        return rate * MiscInfo.BLACKSMITH_POT_RATE_UNIT();
    }

    public float BONUS_RATE_VIOLET_GRASS (String grassId)
    {
        Integer rate = this.BONUS_RATE_VIOLET_GRASS.get(grassId);
        if (rate == null)
            return 0;

        return rate * MiscInfo.BLACKSMITH_VIOLET_GRASS_RATE_UNIT();
    }

    public float GLOVES_RATE (String glovesId)
    {
        Integer rate = this.GLOVES_RATE.get(glovesId);
        if (rate == null)
            return 0;

        return rate * MiscInfo.BLACKSMITH_GLOVES_RATE_UNIT();
    }

    public MakePotHelper makePot (String potId, MapItem materials)
    {
        MakePotHelper helper = new MakePotHelper();

        Recipe recipe = RECIPE(potId);
        if (recipe == null)
            return helper.error(ErrorConst.NULL_OBJECT, "Blacksmith can not make pot " + potId);

        for (String id : BONUS_RATE_VIOLET_GRASS.keySet())
        {
            if (!materials.contains(id))
                continue;

            helper.violetGrassId = id;
        }

        for (String id : GLOVES_RATE.keySet())
        {
            if (!materials.contains(id))
                continue;

            helper.glovesId = id;
        }

        for (MapItem.Entry entry : materials)
        {
            String id = entry.key();
            Integer number = materials.get(id);
            if (number == null || number < 1)
                return helper.error(ErrorConst.INVALID_NUM, "Blacksmith need item quantity");

            ItemInfo item = ConstInfo.getItemInfo(id);
            if (item == null)
                return helper.error(ErrorConst.NULL_ITEM_INFO, "Blacksmith don't know item " + item);

            if (item.TYPE() == ItemType.POT)
                for (int i = 0; i < number; i++)
                    helper.pot.add(item.ID());
        }

        if (MiscInfo.BLACKSMITH_POT_MATERIAL_MIN() > helper.pot.size() || helper.pot.size() > MiscInfo.BLACKSMITH_POT_MATERIAL_MAX())
			return helper.error(ErrorConst.INVALID_NUM, "Blacksmith only need " + MiscInfo.BLACKSMITH_POT_MATERIAL_MIN() + " - " + MiscInfo.BLACKSMITH_POT_MATERIAL_MAX() + ", require send " + helper.pot.size() + " pots");

        helper.potSet = ConstInfo.getComboId(helper.pot);
        helper.successRate += BONUS_RATE_VIOLET_GRASS(helper.violetGrassId);
        helper.successRate += recipe.SET_POT_COMBINE(helper.potSet);

        for (String id : helper.pot)
        {
            helper.successRate += MATERIAL_POT_RATE(potId, id);

            Integer n = helper.materials.get(id);
            if (n == null || n < 1)
                n = 1;
            else
                n += 1;
            helper.materials.put(id, n);
        }

        helper.materials.put(recipe.MATERIALS());

        if (!helper.violetGrassId.isEmpty())
            helper.materials.put(helper.violetGrassId, 1);

        if (!helper.glovesId.isEmpty())
        {
            helper.materials.put(helper.glovesId, 1);

            ThreadLocalRandom random = ThreadLocalRandom.current();

            List<String> temp = new ArrayList<String>();
            temp.addAll(helper.pot);

            int remainPots = (int) Math.ceil(GLOVES_RATE(helper.glovesId) * temp.size());
            while (temp.size() > remainPots)
            {
                int i = random.nextInt(temp.size());
                temp.remove(i);
            }

            for (String id : temp)
            {
                Integer n = helper.failPot.get(id);
                if (n == null || n < 1)
                    n = 1;
                else
                    n += 1;
                helper.failPot.put(id, n);
            }
        }

        helper.successPot.put(potId, 1);

        return helper;
    }

    public static class Recipe
    {
        private int     SPECIAL_SET;
        private String  POT;
        private MapItem MATERIALS;
        private MapItem SET_POT_COMBINE;

        public void init ()
        {
            this.MATERIALS = this.MATERIALS.toUnmodifiableMapItem();
            this.SET_POT_COMBINE = this.SET_POT_COMBINE.toUnmodifiableMapItem();
        }

        public int SPECIAL_SET ()
        {
            return SPECIAL_SET;
        }

        public String POT ()
        {
            return POT;
        }

        public MapItem MATERIALS ()
        {
            return this.MATERIALS;
        }

        public float SET_POT_COMBINE (String potSetId)
        {
            int rate = this.SET_POT_COMBINE.get(potSetId);
            return rate * MiscInfo.BLACKSMITH_POT_SET_RATE_UNIT();
        }

        public boolean isRequireMaterial (String materialId)
        {
            return MATERIALS.contains(materialId);
        }

        public int requireMaterial (String materialId)
        {
            return MATERIALS.get(materialId);
        }
    }

    public static class MakePotHelper
    {
        public String violetGrassId = "";
        public String glovesId      = "";

        public String       potSet = "";
        public List<String> pot    = new ArrayList<String>();

        public float   successRate = 0;
        public MapItem successPot  = new MapItem();

        public MapItem failPot = new MapItem();

        public MapItem materials = new MapItem();

        public byte   errorCode = -1;
        public String errorMsg  = "";

        public MakePotHelper error (int code, String msg)
        {
            this.errorCode = (byte) code;
            this.errorMsg = msg;
            return this;
        }
    }
}
