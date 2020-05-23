//BZError
package bitzero.exceptions 
{
	public class BZError extends Error
	{
		public function BZError(name:String, id:int=0)
		{
			super(name, id);
			return;
		}
	}
}


