package bitzero.net.data
{
	import bitzero.net.data.*;

	public interface ICmd extends Iserial
	{

		public function ICmd();

		function get TypeId(): int;

		function set TypeId(id:int): void;

		function getHeadData(id:int): int;

	}
}
