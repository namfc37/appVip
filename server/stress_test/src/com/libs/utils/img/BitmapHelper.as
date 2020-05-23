package com.libs.utils.img 
{
	import com.adobe.images.JPGEncoder;
	import com.adobe.images.PNGEncoder;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.display.LoaderInfo;
	import flash.display.PixelSnapping;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;
	/**
	 * ...
	 * @author ToanTN
	 */
	public class BitmapHelper 
	{
		private var allBitmapBytes:Object;
		private var allInfo:Object;
		
		public function BitmapHelper() 
		{
			this.allBitmapBytes = new Object();
			this.allInfo = new Object();
		}
		
		public function getImage(id:String):ByteArray
		{
			return this.allBitmapBytes[id];
		}
		
		public function crop( _x:Number, _y:Number, _width:Number, _height:Number, img:BitmapData = null):BitmapData
		{
			
			
			var cropped:BitmapData = new BitmapData(_width, _height, true, 0x00000000);
			cropped.copyPixels(img, new Rectangle(_x, _y, _width, _height), new Point(0,0));
			//Main.bmTest.bitmapData = cropped;
			trace("source", img.width,img.height);
			trace("des", _x, _y, _width, _height);
			
			return cropped;
		}
		
		public static function getFirstNonTransparentPixelLooping(bmd:BitmapData) :Point
		{
			var ix:uint,iy:uint,bmd_height:uint=bmd.height,bmd_width:uint=bmd.width;
			for (iy = 0; iy < bmd_height; iy++)
			{
				for (ix = 0; ix < bmd_width; ix++)
				{
					if (bmd.getPixel32(ix, iy) > 0x00000000) {
						
						return new Point(ix,iy);
					}
				}
			}
			return null;
		}
		
		public static function getFirstXNonTransparentPixelLooping(bmd:BitmapData) :Point
		{
			var ix:uint,iy:uint,bmd_height:uint=bmd.height,bmd_width:uint=bmd.width;
			for (ix = 0; ix < bmd_width; ix++)
			{
				for (iy = 0; iy < bmd_height; iy++)
				{
					if (bmd.getPixel32(ix, iy) > 0x00000000) {
						
						return new Point(ix,iy);
					}
				}
			}
			return null;
		}
		
			
		public static function getLastNonTransparentPixelLooping(bmd:BitmapData) :Point
		{
			var ix:uint, iy:uint, bmd_height:uint = bmd.height, bmd_width:uint = bmd.width;
			trace("dai rong:",bmd_height, bmd_width);
			for (iy = bmd_height -1; iy >= 1; iy--)
			{
				for (ix = bmd_width -1; ix >= 1; ix--)
				{
					//trace("dai rong:",ix,  iy);
					if (bmd.getPixel32(ix, iy) > 0x00000000) {
						
						return new Point(ix,iy);
					}
				}
			}
			return null;
		}
		
		public static function getLastXNonTransparentPixelLooping(bmd:BitmapData) :Point
		{
			var ix:uint,iy:uint,bmd_height:uint=bmd.height,bmd_width:uint=bmd.width;			
			for (ix = bmd_width -1; ix >=1; ix--)
			{
				for (iy = bmd_height -1; iy >= 1; iy--)
				{
					if (bmd.getPixel32(ix, iy) > 0x00000000) {
						
						return new Point(ix,iy);
					}
				}
			}
			return null;
		}
		
		//Save cropped image 
		public function saveCroppedImage(name:String,jpgSource: BitmapData):ByteArray
		{
		// var myEncoder:PNGEncoder = new PNGEncoder();PNGEncoder.encode
		 
		 var PointCrop1:Point = getFirstNonTransparentPixelLooping(jpgSource);
		 var PointCrop2:Point = getFirstXNonTransparentPixelLooping(jpgSource);
		 
		 var PointCrop3:Point = getLastNonTransparentPixelLooping(jpgSource);
		 var PointCrop4:Point = getLastXNonTransparentPixelLooping(jpgSource);
		 trace("ok");
		 var PointCrop:Point = new Point(PointCrop2.x, PointCrop1.y);
		 var EndCrop:Point = new Point(PointCrop4.x,PointCrop3.y);
		
		 //Create jpg to be exported
		 var wi:Number = EndCrop.x - PointCrop.x;
		 var hi:Number = EndCrop.y - PointCrop.y;
		 
		 var obj:Object = new Object();
		 obj.x = PointCrop.x;
		 obj.y = PointCrop.y;
		 obj.width = wi;
		 obj.height = hi;
		 
		 var jpgDes:BitmapData = crop(PointCrop.x, PointCrop.y, wi, hi, jpgSource);
		 //new BitmapData (jpgSource.width - PointCrop.x,jpgSource.height - PointCrop.y);
		 //Create byte array to hold jpg data
		 var byteArray:ByteArray = PNGEncoder.encode(jpgDes);
		 
		 allBitmapBytes[name] = byteArray;
		 allInfo[name] = obj;
		 
		// trace(name, PointCrop.x, PointCrop.y,wi,hi);
		 		 
		 return byteArray;
		}
		
		public function cropData(name:String,data:ByteArray):void
		{
			var frLoader:BitmapLoader  = new BitmapLoader();
			frLoader.idName = name;
			frLoader.loadBytes(data);
			frLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, this.onFrameLoaded);
		}
		
		public function getImgInfo(id:String):Object 
		{
			return allInfo[id];
		}
		
		 private function onFrameLoaded(event:Event): void
		{
			var frLoader:BitmapLoader = BitmapLoader(LoaderInfo(event.currentTarget).loader);		
			var bmData:BitmapData = Bitmap(event.target.content).bitmapData;
			
			/*var PointCrop:Point = getFirstNonTransparentPixelLooping(bmData);
			trace(frLoader.idName,PointCrop.x, PointCrop.y);
			*/
			
			saveCroppedImage(frLoader.idName, bmData);			
			return;
		}// end function
		
	}
}

	import flash.display.Loader;
	class BitmapLoader extends Loader
	{
		public var idName:String;

		function BitmapLoader()
		{
			return;
		}// end function

	}