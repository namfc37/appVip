package bitzero.net.data
{
	import bitzero.net.data.*;
	import bitzero.net.utils.*;
	import flash.utils.*;
	import bitzero.logging.*;

	public class BaseCmd 
	{
		public var crlID:int;
		public var typeId:int;
		protected var bodys:Encoder;

		public function BaseCmd(cmId:int = 0)
		{		
			this.typeId = cmId;
			this.crlID = 1;
			
			createBodySegment();
			return;
		}

		public function get TypeId():int
		{
			return this.typeId;
		}

		public function set TypeId(id:int):void
		{
			this.typeId = id;
			return;
		}
		
		public function set ControllerId(id:int):void
		{
			this.crlID = id;
			return;
		}

		public function getCmdBodys():ByteArray
		{
			return this.bodys.getBytes();
		}

		protected function resetBody():void
		{
			this.bodys = new Encoder();
			return;
		}

		protected function createBodySegment():ByteArray
		{
			this.bodys = new Encoder();
			return this.bodys.getBytes();
		}

		public function createBody():Boolean
		{
			return true;
		}
		
		protected function writeEndObject():void
		{
			this.bodys.markEndObject();
		}

		protected function writeString(key:int, str:String):void
		{
			if (str == null)
				str = "";
			
			this.bodys.putString(key, str);
		}
		
		protected function writeIntArray(key:int, arr:Vector.<int>):void
		{
			if (arr == null)
				arr = new Vector.<int>(0);
			
			this.bodys.putIntArray (key, arr);
		}
		
		protected function writeBooleanArray(key:int, arr:Vector.<Boolean>):void
		{
			if (arr == null)
				arr = new Vector.<Boolean>(0);
			
			this.bodys.putBooleanArray(key, arr);
		}
		
		protected function writeByteArray(key:int, arr:Vector.<int>):void
		{
			if (arr == null)
				arr = new Vector.<int>(0);
			
			this.bodys.putByteArray(key, arr);
		}
		
		protected function writeShortArray(key:int, arr:Vector.<int>):void
		{
			if (arr == null)
				arr = new Vector.<int>(0);
			
			this.bodys.putShortArray(key, arr);
		}
		
		protected function writeFloatArray(key:int, arr:Vector.<Number>):void
		{
			if (arr == null)
				arr = new Vector.<Number>(0);
			
			this.bodys.putFloatArray(key, arr);
		}
		
		protected function writeDoubleArray(key:int, arr:Vector.<Number>):void
		{
			if (arr == null)
				arr = new Vector.<Number>(0);
			
			this.bodys.putFloatArray(key, arr);
		}
		
		protected function writeStringArray(key:int, arr:Vector.<String>):void
		{
			if (arr == null)
				arr = new Vector.<String>(0);
			
			this.bodys.putStringArray(key, arr);
		}
		
		protected function writeLongArray(key:int, arr:Vector.<Number>):void
		{
			if (arr == null)
				arr = new Vector.<Number>(0);
			
			this.bodys.putLongArray(key, arr);
		}
		
		protected function writeBoolean(key:int, pa:Boolean):void
		{
			this.bodys.putBoolean(key, pa);
		}
		
		protected function writeByte(key:int, pa:Number):void
		{
			this.bodys.putByte(key, pa);
		}
		
		protected function writeShort(key:int, pa:Number):void
		{
			this.bodys.putShort(key, pa);
		}
		
		protected function writeInt(key:int, pa:Number):void
		{
			this.bodys.putInt(key, pa);
		}
		
		protected function writeLong(key:int, pa:Number):void
		{
			this.bodys.putDouble(key, pa);
		}
	}
}
