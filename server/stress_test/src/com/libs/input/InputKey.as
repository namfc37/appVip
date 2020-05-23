/*******************************************************************************
 * PushButton Engine
 * Copyright (C) 2009 PushButton Labs, LLC
 * For more information see http://www.pushbuttonengine.com
 *
 * This file is licensed under the terms of the MIT license, which is included
 * in the License.html file at the root directory of this SDK.
 ******************************************************************************/
package com.libs.input
{

	/**
	 * Enumeration class that maps friendly key names to their key code equivalent. This class
	 * should not be instantiated directly, rather, one of the constants should be used.
	 */   
	public class InputKey 
	{
		public static const INVALID:InputKey = new InputKey(0);

		public static const BACKSPACE:InputKey = new InputKey(8);
		public static const TAB:InputKey = new InputKey(9);
		public static const ENTER:InputKey = new InputKey(13);
		public static const COMMAND:InputKey = new InputKey(15);
		public static const SHIFT:InputKey = new InputKey(16);
		public static const CONTROL:InputKey = new InputKey(17);
		public static const ALT:InputKey = new InputKey(18);
		public static const PAUSE:InputKey = new InputKey(19);
		public static const CAPS_LOCK:InputKey = new InputKey(20);
		public static const ESCAPE:InputKey = new InputKey(27);

		public static const SPACE:InputKey = new InputKey(32);
		public static const PAGE_UP:InputKey = new InputKey(33);
		public static const PAGE_DOWN:InputKey = new InputKey(34);
		public static const END:InputKey = new InputKey(35);
		public static const HOME:InputKey = new InputKey(36);
		public static const LEFT:InputKey = new InputKey(37);
		public static const UP:InputKey = new InputKey(38);
		public static const RIGHT:InputKey = new InputKey(39);
		public static const DOWN:InputKey = new InputKey(40);

		public static const INSERT:InputKey = new InputKey(45);
		public static const DELETE:InputKey = new InputKey(46);

		public static const ZERO:InputKey = new InputKey(48);
		public static const ONE:InputKey = new InputKey(49);
		public static const TWO:InputKey = new InputKey(50);
		public static const THREE:InputKey = new InputKey(51);
		public static const FOUR:InputKey = new InputKey(52);
		public static const FIVE:InputKey = new InputKey(53);
		public static const SIX:InputKey = new InputKey(54);
		public static const SEVEN:InputKey = new InputKey(55);
		public static const EIGHT:InputKey = new InputKey(56);
		public static const NINE:InputKey = new InputKey(57);

		public static const A:InputKey = new InputKey(65);
		public static const B:InputKey = new InputKey(66);
		public static const C:InputKey = new InputKey(67);
		public static const D:InputKey = new InputKey(68);
		public static const E:InputKey = new InputKey(69);
		public static const F:InputKey = new InputKey(70);
		public static const G:InputKey = new InputKey(71);
		public static const H:InputKey = new InputKey(72);
		public static const I:InputKey = new InputKey(73);
		public static const J:InputKey = new InputKey(74);
		public static const K:InputKey = new InputKey(75);
		public static const L:InputKey = new InputKey(76);
		public static const M:InputKey = new InputKey(77);
		public static const N:InputKey = new InputKey(78);
		public static const O:InputKey = new InputKey(79);
		public static const P:InputKey = new InputKey(80);
		public static const Q:InputKey = new InputKey(81);
		public static const R:InputKey = new InputKey(82);
		public static const S:InputKey = new InputKey(83);
		public static const T:InputKey = new InputKey(84);
		public static const U:InputKey = new InputKey(85);
		public static const V:InputKey = new InputKey(86);
		public static const W:InputKey = new InputKey(87);
		public static const X:InputKey = new InputKey(88);
		public static const Y:InputKey = new InputKey(89);
		public static const Z:InputKey = new InputKey(90);

		public static const NUM0:InputKey = new InputKey(96);
		public static const NUM1:InputKey = new InputKey(97);
		public static const NUM2:InputKey = new InputKey(98);
		public static const NUM3:InputKey = new InputKey(99);
		public static const NUM4:InputKey = new InputKey(100);
		public static const NUM5:InputKey = new InputKey(101);
		public static const NUM6:InputKey = new InputKey(102);
		public static const NUM7:InputKey = new InputKey(103);
		public static const NUM8:InputKey = new InputKey(104);
		public static const NUM9:InputKey = new InputKey(105);

		public static const MULTIPLY:InputKey = new InputKey(106);
		public static const ADD:InputKey = new InputKey(107);
		public static const NUMENTER:InputKey = new InputKey(108);
		public static const SUBTRACT:InputKey = new InputKey(109);
		public static const DECIMAL:InputKey = new InputKey(110);
		public static const DIVIDE:InputKey = new InputKey(111);

		public static const F1:InputKey = new InputKey(112);
		public static const F2:InputKey = new InputKey(113);
		public static const F3:InputKey = new InputKey(114);
		public static const F4:InputKey = new InputKey(115);
		public static const F5:InputKey = new InputKey(116);
		public static const F6:InputKey = new InputKey(117);
		public static const F7:InputKey = new InputKey(118);
		public static const F8:InputKey = new InputKey(119);
		public static const F9:InputKey = new InputKey(120);
		// F10 is considered 'reserved' by Flash
		public static const F11:InputKey = new InputKey(122);
		public static const F12:InputKey = new InputKey(123);

		public static const NUM_LOCK:InputKey = new InputKey(144);
		public static const SCROLL_LOCK:InputKey = new InputKey(145);

		public static const COLON:InputKey = new InputKey(186);
		public static const PLUS:InputKey = new InputKey(187);
		public static const COMMA:InputKey = new InputKey(188);
		public static const MINUS:InputKey = new InputKey(189);
		public static const PERIOD:InputKey = new InputKey(190);
		public static const BACKSLASH:InputKey = new InputKey(191);
		public static const TILDE:InputKey = new InputKey(192);

		public static const LEFT_BRACKET:InputKey = new InputKey(219);
		public static const SLASH:InputKey = new InputKey(220);
		public static const RIGHT_BRACKET:InputKey = new InputKey(221);
		public static const QUOTE:InputKey = new InputKey(222);

		public static const MOUSE_BUTTON:InputKey = new InputKey(253);
		public static const MOUSE_X:InputKey = new InputKey(254);
		public static const MOUSE_Y:InputKey = new InputKey(255);
		public static const MOUSE_WHEEL:InputKey = new InputKey(256);
		public static const MOUSE_HOVER:InputKey = new InputKey(257);

		public function InputKey(keyCode:int=0)
		{
			_keyCode = keyCode;
		}
		
		 /**
		 * The key code that this wraps.
		 */
		public function get keyCode():int
		{
			return _keyCode;
		}

		private var _keyCode:int = 0;
	}
}

