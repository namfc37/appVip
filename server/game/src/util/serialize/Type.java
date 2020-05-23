package util.serialize;

public interface Type
{
    byte TYPE_END_OBJECT     = 0;
    byte TYPE_BOOLEAN_TRUE   = 1;
    byte TYPE_BOOLEAN_FALSE  = 2;
    byte TYPE_BYTE           = 3;
    byte TYPE_SHORT          = 4;
    byte TYPE_INT            = 5;
    byte TYPE_LONG           = 6;
    byte TYPE_FLOAT          = 7;
    byte TYPE_DOUBLE         = 8;
    byte TYPE_STRING         = 9;
    byte TYPE_OBJECT         = 10;
    byte TYPE_ARRAY_BOOLEAN  = 11;
    byte TYPE_ARRAY_BYTE     = 12;
    byte TYPE_ARRAY_SHORT    = 13;
    byte TYPE_ARRAY_INT      = 14;
    byte TYPE_ARRAY_LONG     = 15;
    byte TYPE_ARRAY_STRING   = 16;
    byte TYPE_ARRAY_OBJECT   = 17;
    byte TYPE_MAP_ITEM       = 18;
    byte TYPE_ZERO           = 19;
    byte TYPE_ARRAY_MAP_ITEM = 20;
}
