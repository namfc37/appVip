//IController
package bitzero.engine 
{
	public interface IController
	{
		function get id():int;

		function set id(id:int):void;

		function handleMessage(msg:IMessage):void;
	}
}


