//BZIOHandler
package bitzero.core 
{
	import bitzero.engine.*;
	import bitzero.exceptions.*;
	import bitzero.logging.*;
	import bitzero.protocol.*;
	import bitzero.protocol.serialization.*;
	import flash.errors.*;
	import flash.utils.*;
	
	public class BZIOHandler implements IoHandler
	{
		private const EMPTY_BUFFER:ByteArray=new ByteArray();

		public static const INT_BYTE_SIZE:int=4;

		public static const SHORT_BYTE_SIZE:int=2;

		private var ezClient:EngineClient;

		private var log:Logger;

		private var readState:int;

		private var protocolCodec:IProtocolCodec;

		private var pendingPacket:PendingPacket;
		
		public function BZIOHandler(ezC:EngineClient)
		{
			super();
			this.ezClient = ezC;
			this.log = Logger.getInstance();
			this.readState = PacketReadState.WAIT_NEW_PACKET;
			this.protocolCodec = new BZProtocolCodec(this, ezC);
			return;
		}

		private function handleNewPacket(data:ByteArray):ByteArray
		{
			log.debug("Handling New Packet");
			var headerByte:int=data.readByte();
			if (!(headerByte & 128) > 0) 
			{
				throw new bitzero.exceptions.BZError("Unexpected header byte: " + headerByte);
			}
			var ph:PacketHeader=PacketHeader.fromBinary(headerByte);
			pendingPacket = new PendingPacket(ph);
			readState = PacketReadState.WAIT_DATA_SIZE;
			return resizeByteArray(data, 1, (length - 1));
		}

		private function handlePacketData(data:ByteArray):ByteArray
		{
			var remainLen:int=pendingPacket.header.expectedLen - pendingPacket.buffer.length;
			var isCompletePacket:Boolean=data.length > remainLen;
			log.debug("Handling Data: " + data.length + ", previous state: " + pendingPacket.buffer.length + "/" + pendingPacket.header.expectedLen);
			if (data.length >= remainLen) 
			{
				pendingPacket.buffer.writeBytes(data, 0, remainLen);
				log.debug("<<< Packet Complete >>>");
				if (pendingPacket.header.compressed) 
				{
					pendingPacket.buffer.uncompress();
				}
				protocolCodec.onPacketRead(pendingPacket.buffer);
				readState = PacketReadState.WAIT_NEW_PACKET;
			}
			else 
			{
				pendingPacket.buffer.writeBytes(data);
			}
			if (isCompletePacket) 
			{
				data = resizeByteArray(data, remainLen, data.length - remainLen);
			}
			else 
			{
				data = EMPTY_BUFFER;
			}
			return data;
		}

		private function handleDataSize(data:ByteArray):ByteArray
		{
			log.debug("Handling Header Size. Size: " + data.length + " (" + (pendingPacket.header.bigSized ? "big": "small") + ")");
			var packetLen:int=-1;
			var LenSize:int=2;
			if (pendingPacket.header.bigSized) 
			{
				if (data.length >= 4) 
				{
					packetLen = data.readInt();
				}
				LenSize = 4;
			}
			else if (data.length >= 2) 
			{
				packetLen = data.readShort();
			}
			if (packetLen == -1) 
			{
				readState = PacketReadState.WAIT_DATA_SIZE_FRAGMENT;
				pendingPacket.buffer.writeBytes(data);
				data = EMPTY_BUFFER;
			}
			else 
			{
				pendingPacket.header.expectedLen = packetLen;
				data = resizeByteArray(data, LenSize, data.length - LenSize);
				readState = PacketReadState.WAIT_DATA;
			}
			return data;
		}

		private function handleDataSizeFragment(data:ByteArray):ByteArray
		{
			var packetLen:int=0;
			log.debug("Handling Size fragment. Data: " + data.length);
			var LenSize:int=pendingPacket.header.bigSized ? 4 - pendingPacket.buffer.position: 2 - pendingPacket.buffer.position;
			if (data.length >= LenSize) 
			{
				pendingPacket.buffer.writeBytes(data, 0, LenSize);
				pendingPacket.buffer.position = 0;
				packetLen = pendingPacket.header.bigSized ? pendingPacket.buffer.readInt(): pendingPacket.buffer.readShort();
				log.debug("DataSize is ready:", packetLen, "bytes");
				pendingPacket.header.expectedLen = packetLen;
				pendingPacket.buffer = new ByteArray();
				readState = PacketReadState.WAIT_DATA;
				if (data.length > LenSize) 
				{
					data = resizeByteArray(data, LenSize, data.length - LenSize);
				}
				else 
				{
					data = EMPTY_BUFFER;
				}
			}
			else 
			{
				pendingPacket.buffer.writeBytes(data);
				data = EMPTY_BUFFER;
			}
			return data;
		}

		public function onDataRead(data:ByteArray):void
		{
			if (ezClient.bz.debug) 
			{
				log.debug("Data Read: " + DefaultObjectDumpFormatter.hexDump(data));
			}
			data.position = 0;
			if (data.length == 0) 
			{
				throw new BZError("Unexpected empty packet data: no readable bytes available!");
			}
			while (data.length > 0) 
			{
				if (readState == PacketReadState.WAIT_NEW_PACKET) 
				{
					data = handleNewPacket(data);
				}
				if (readState == PacketReadState.WAIT_DATA_SIZE) 
				{
					data = handleDataSize(data);
				}
				if (readState == PacketReadState.WAIT_DATA_SIZE_FRAGMENT) 
				{
					data = handleDataSizeFragment(data);
				}
				if (readState != PacketReadState.WAIT_DATA) 
				{
					continue;
				}
				data = handlePacketData(data);
			}
			return;
			
			
		}
		
		

		private function resizeByteArray(data:ByteArray, offset:int, len:int):ByteArray
		{
			var newdata:ByteArray=new ByteArray();
			newdata.writeBytes(data, offset, len);
			newdata.position = 0;
			return newdata;
		}

		public function get codec():IProtocolCodec
		{
			return protocolCodec;
		}

		public function onDataWrite(msg:IMessage):void
		{
			var binData:ByteArray;
			var message:IMessage;
			var sizeBytes:int;
			var isCompressed:Boolean;
			var packetHeader:PacketHeader;
			var writeBuffer:ByteArray;

			var loc1:*;
			message = msg;
			writeBuffer = new ByteArray();
			binData = message.content;
			binData.position = 0;
			
			isCompressed = false;
			if (binData.length > ezClient.compressionThreshold) 
			{
				binData.compress();
				isCompressed = true;
			}
			sizeBytes = SHORT_BYTE_SIZE;
			if (binData.length > 65535) 
			{
				sizeBytes = INT_BYTE_SIZE;
			}
			packetHeader = new PacketHeader(message.isEncrypted, isCompressed, false, sizeBytes == INT_BYTE_SIZE);
			writeBuffer.writeByte(packetHeader.encode());
			if (sizeBytes > SHORT_BYTE_SIZE) 
			{
				writeBuffer.writeInt(binData.length);
			}
			else 
			{
				writeBuffer.writeShort(binData.length);
			}
			writeBuffer.writeBytes(binData);
			if (ezClient.socket.connected) 
			{
				try 
				{
					ezClient.socket.writeBytes(writeBuffer);
					ezClient.socket.flush();
					if (ezClient.bz.debug) 
					{
						log.debug("Data written: " + message.content.toString());
					}
				}
				catch (error:flash.errors.IOError)
				{
					log.warn("Write operation failed due to I/O Error: " + error.toString());
				}
			}
			return;
		}
	}
}


