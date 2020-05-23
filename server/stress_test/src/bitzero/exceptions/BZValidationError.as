//BZValidationError
package bitzero.exceptions 
{
	public class BZValidationError extends Error
	{
		private var _errors:Array;
		 
		public function BZValidationError(name:String, errs:Array, id:int=0)
		{
			super(name, id);
			_errors = errs;
			return;
		}

		public function get errors():Array
		{
			return _errors;
		}
	}
}


