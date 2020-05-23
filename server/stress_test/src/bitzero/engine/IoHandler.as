//IoHandler
package bitzero.engine 
{
	import bitzero.protocol.*;
	import flash.utils.*;
	
	public interface IoHandler
	{
		function get codec():IProtocolCodec;

		function onDataWrite(p:IMessage):void;

		function onDataRead(ba:ByteArray):void;
	}
}


