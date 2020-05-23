//IMessage
package bitzero.engine 
{
	import flash.utils.ByteArray;
	
	public interface IMessage
	{
		function get isEncrypted():Boolean;

		function set content(data:ByteArray):void;

		function set isEncrypted(e:Boolean):void;

		function set id(id:int):void;

		function get content():ByteArray;

		function set targetController(id:int):void;

		function get id():int;

		function get targetController():int;
	}
}


