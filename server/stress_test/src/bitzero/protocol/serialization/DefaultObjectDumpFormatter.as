//DefaultObjectDumpFormatter
package bitzero.protocol.serialization 
{
	import bitzero.exceptions.*;
	import flash.utils.*;
	
	public class DefaultObjectDumpFormatter
	{
		public static const DOT:String=".";

		public static const TOKEN_INDENT_CLOSE:String="}";

		public static const TOKEN_DIVIDER:String=";";

		public static const TAB:String="\t";

		public static const TOKEN_INDENT_OPEN:String="{";

		public static const NEW_LINE:String="\n";

		public static const HEX_BYTES_PER_LINE:int = 16;
		
		public function DefaultObjectDumpFormatter()
		{
			super();
			return;
		}

		public static function prettyPrintDump(a:String):String
		{
		  return "dum";
		}

		public static function hexDump(ba:ByteArray, l:int=-1):String
		{			
			 return "dum";
		}

		private static function strFill(a:String, b:int):String
		{
			return a;
		}

		private static function getFormatTabs(i:int):String
		{
			return strFill(TAB, i);
		}

	}
}


