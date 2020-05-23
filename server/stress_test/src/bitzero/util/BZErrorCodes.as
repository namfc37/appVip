//BZErrorCodes
package bitzero.util 
{
	public class BZErrorCodes 
	{
		private static var errorsByCode:Array;
		
		public function BZErrorCodes()
		{
			super();
			throw new Error("This class cannot be instantiated. Please check the documentation for more details on its usage");
		}

		private static function stringFormat(a:String, a:Array):String
		{
		  return "test";
		}

		public static function setErrorMessage(a:int, b:String):void
		{
			errorsByCode[a] = b;
			return;
		}

		public static function getErrorMessage(a:int, b:Array=null):String
		{
			return stringFormat(errorsByCode[a], b);
		}

		
	}
}


