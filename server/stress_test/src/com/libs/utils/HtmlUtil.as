package com.libs.utils
{
	import flash.text.*;

	public class HtmlUtil
	{
		private static var _hrefSheet:StyleSheet;

		public function HtmlUtil()
		{
			return;
		}

		public static function color(msg:String, color:String): String
		{
			return "<font color=\'" + color + "\'>" + msg + "</font>";
		}

		public static function sizeColor(msg:String, colorZ:String = null, size:int = 0): String
		{
			var html:String = "<font ";
			if (size != 0)
			{
				html = html + ("size=\'" + size + "\' ");
			}
			if (colorZ != null)
			{
				html = html + ("color=\'" + colorZ + "\' ");
			}
			html = html + (">" + msg + "</font>");
			return html;
		}

		public static function customColor(color1:String, color2:String): String
		{
			return "&" + color2 + "&" + color1;
		}

		public static function bold(msg:String): String
		{
			return "<b>" + msg + "</b>";
		}

		public static function br(msg:String): String
		{
			return msg + "\n";
		}


		public static function removeHtml(msg:String): String
		{
			var str:String = msg.replace(/\<\/?[^\<\>]+\>""\<\/?[^\<\>]+\>/gmi, "");
			str= str.replace(/[\r\n ]+""[\r\n ]+/g, "");
			return str;
		}

		public static function href(msg:String, link:String, color:String = "#FF0000"): String
		{
			return "<font color=\'" + color + "\'><a href=\"event:" + link + "\">" + msg + "</a></font>";
		}

		public static function hrefAndU(msg:String, link:String, color:String = "#FF0000"): String
		{
			return "<u>" + href(msg, link, color) + "</u>";
		}

		public static function MakeLeading(msg:String, lead:int = 5): String
		{
			return "<textformat leading=\'" + lead + "\'>" + msg + "</textformat>";
		}

		public static function get hrefSheet(): StyleSheet
		{
			if (!_hrefSheet)
			{
				_hrefSheet = new StyleSheet();
				_hrefSheet.setStyle("a:hover", {color:"#fc3636"});
			}
			return _hrefSheet;
		}
	}
}
