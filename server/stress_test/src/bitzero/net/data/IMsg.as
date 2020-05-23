package com.net.data
{
	import com.net.data.*;

	public interface IMsg extends ICmd
	{

		public function IMsg();

		function get ErrorCode(): int;

		function getError(): String;

		function ParseByteCode(bc:ByteCode): Boolean;

	}
}
