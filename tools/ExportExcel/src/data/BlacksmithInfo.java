package data;

import java.util.ArrayList;
import java.util.HashMap;

public class BlacksmithInfo {
	public HashMap<String, Recipe> RECIPES;
	public HashMap<String, ArrayList<Integer>> MATERIAL_POT_RATE;
	public HashMap<Integer, ArrayList<String>> SPECIAL_SETS;
	public HashMap<String, Integer> BONUS_RATE_VIOLET_GRASS;
	public HashMap<String, Integer> GLOVES_RATE;

	public BlacksmithInfo() {
		this.RECIPES = new HashMap<String, BlacksmithInfo.Recipe>();
		this.MATERIAL_POT_RATE = new HashMap<String, ArrayList<Integer>>();
		this.SPECIAL_SETS = new HashMap<Integer, ArrayList<String>>();
		this.BONUS_RATE_VIOLET_GRASS = new HashMap<String, Integer>();
		this.GLOVES_RATE = new HashMap<String, Integer>();
	}

	public static class Recipe {
		public int SPECIAL_SET;
		public String POT;
		public HashMap<String, Integer> MATERIALS;
		public HashMap<String, Integer> SET_POT_COMBINE;

		public Recipe() {
			this.MATERIALS = new HashMap<String, Integer>();
			this.SET_POT_COMBINE = new HashMap<String, Integer>();
		}
	}
}
