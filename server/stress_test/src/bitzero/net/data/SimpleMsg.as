package bitzero.net.data
{
	import flash.utils.*;

	public class SimpleMsg extends BaseMsg
	{
		private var _body:ByteArray;

		public function SimpleMsg()
		{
			return;
		}

		override public function ParseBody(ba:ByteArray): Boolean
		{
			this._body = ba;
			return true;
		}

		public function hasNext(): Boolean
		{
			var result:Boolean;
			try
			{
				result = Boolean(this._body.bytesAvailable);
			}
			catch (e:Error)
			{
				result = false;
			}
			return result;
		}

		public function readInt(): int
		{
			try
			{
				return this._body.readInt();
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		public function readShort(): int
		{
			try
			{
				return this._body.readShort();
			}
			catch (e:Error)
			{
			}
			return 0;
		}

		public function readStr(): String
		{
			try
			{
				return this._body.readUTF();
			}
			catch (e:Error)
			{
			}
			return "";
		}

		public function readDouble(): Number
		{
			try
			{
				return this._body.readDouble();
			}
			catch (e:Error)
			{
			}
			return 0;
		}

	}
}
