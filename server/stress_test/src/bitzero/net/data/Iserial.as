package bitzero.net.data
{
	import flash.utils.*;

	public interface Iserial
	{

		public function Iserial();

		function head2ByteArray(): ByteArray;

		function getCmdBodys(): Array;

		function createBody(): Boolean;

	}
}
