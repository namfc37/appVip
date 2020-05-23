import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class ConfigService {

    public static void main(String[] args) throws Exception {
        String input = args[0];
        String service = args[1];
        int group = Integer.parseInt(args[2]);        
        String extension = args.length > 3 ? args[3] : "";

        System.out.println();
        System.out.println("input   : " + input);
        System.out.println("service : " + service);
        System.out.println("group   : " + group);
        System.out.println("extension   : " + extension);

        Path path = Paths.get(input);
        String filename = path.getFileName().toString();
        System.out.println("filename   : " + filename);
        
        boolean isXml = filename.endsWith(".xml");
        //System.out.println("isXml   : " + isXml);

        List<String> lines = Files.readAllLines(Paths.get(input));
        BufferedWriter o = Files.newBufferedWriter(Paths.get("./" + filename));
        if (isXml)
        {
            for (String line : lines)
            {
                if (line.contains("port=\"80"))
                    o.write("<socket address=\"0.0.0.0\" port=\"" + (8000 + group) + "\" type=\"TCP\"/>");
				else if (line.contains("port=\"90"))
                    o.write("<socket address=\"0.0.0.0\" port=\"" + (9000 + group) + "\" type=\"TCP\"/>");
				else if (line.contains("<adminTcpPort>"))
                    o.write("<adminTcpPort>" + (9000 + group) + "</adminTcpPort>");
                else if (line.contains("<tcpPort>83"))
                    o.write("<tcpPort>" + (8300 + group) + "</tcpPort>");
                else if (line.contains("<sslPort>83"))
                    o.write("<sslPort>" + (8300 + group) + "</sslPort>");
                else if (line.contains("<isActive>false</isActive>")) //cheat: nên parse xml để bật web socket
                {
                    if (extension.length() > 0)
                        o.write("<isActive>true</isActive>");
                    else
                        o.write("<isActive>false</isActive>");
                }
                else
                    o.write(line);
                o.newLine();
            }
        }
        else
        {
            for (String line : lines)
            {
                if (line.startsWith("EnvService"))
                    o.write("EnvService = " + service);
                else if (line.startsWith("EnvGroup"))
                    o.write("EnvGroup = " + group);
                else if (line.startsWith("extension.main.path"))
                    o.write("extension.main.path=" + extension);
                else
                    o.write(line);
                o.newLine();
            }
        }
        o.close();
    }
}
