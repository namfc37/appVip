//IProtocolCodec
package bitzero.protocol 
{
	import bitzero.engine.*;
	import flash.utils.*;
	
	public interface IProtocolCodec
	{
		function onPacketWrite(msg:IMessage):void;

		function get ioHandler():IoHandler;

		function onPacketRead(ba:ByteArray):void;

		function set ioHandler(ioH:IoHandler):void;
	}
}


