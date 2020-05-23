//LogLevel
package bitzero.logging 
{
	public class LogLevel
	{
		
		public static const DEBUG:int=100;

		public static const WARN:int=300;

		public static const ERROR:int=400;

		public static const INFO:int = 200;
		
		public function LogLevel()
		{
			super();
			return;
		}

		public static function fromString(type:int):String
		{
			var typeName:String="Unknown";
			if (type != DEBUG) 
			{
				if (type != INFO) 
				{
					if (type != WARN) 
					{
						if (type == ERROR) 
						{
							typeName = "ERROR";
						}
					}
					else 
					{
						typeName = "WARN";
					}
				}
				else 
				{
					typeName = "INFO";
				}
			}
			else 
			{
				typeName = "DEBUG";
			}
			return typeName;
		}
	}
}


