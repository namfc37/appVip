package bitzero.net.data
{
	import flash.utils.*;

	public class SimpleCmd extends BaseCmd
	{
		private var body:ByteArray;

		public function SimpleCmd(cmId:int = 0)
		{
			super(cmId);
			this.body = createBodySegment();
			return;
		}

		public function writeInt(x:int): void
		{
			this.body.writeInt(x);
			return;
		}

		public function writeStr(str:String): void
		{
			writeUTF(this.body, str);
			return;
		}

		public function writeShort(sh:int): void
		{
			this.body.writeShort(sh);
			return;
		}

		public function write(... args): void
		{
			var i:int = 0;
			var arg:*;
			while (i < args.length)
			{
				
				arg = args[i];
				if (arg is int)
				{
					this.writeInt(arg);
				}
				else if (arg is String)
				{
					this.writeStr(arg);
				}
				i += 1;
			}
			return;
		}

	}
}
