package util.io;

import io.netty.handler.codec.http.QueryStringEncoder;

public class UrlEncoder extends QueryStringEncoder
{
    public UrlEncoder (String uri)
    {
        super(uri);
    }

    public void addParam (String name, Object value)
    {
        addParam(name, value.toString());
    }

    @Override
    public void addParam (String name, String value)
    {
        super.addParam(name, value == null ? "" : value);
    }
}
