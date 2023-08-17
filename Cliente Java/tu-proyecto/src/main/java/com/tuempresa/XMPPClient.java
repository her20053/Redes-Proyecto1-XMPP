import org.jivesoftware.smack.AbstractXMPPConnection;
import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.SmackException;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.tcp.XMPPTCPConnection;
import org.jivesoftware.smack.tcp.XMPPTCPConnectionConfiguration;

public class XMPPClient {

    public static void main(String[] args) {
        String username = "your_username";
        String password = "your_password";
        String domain = "alumchat.xyz";
        int port = 5222; // Puerto por defecto para XMPP

        XMPPTCPConnectionConfiguration config = XMPPTCPConnectionConfiguration.builder()
                .setUsernameAndPassword(username, password)
                .setXmppDomain(domain)
                .setPort(port)
                .setSecurityMode(ConnectionConfiguration.SecurityMode.disabled) // Desactivar la verificación de
                                                                                // certificados TLS (no recomendado para
                                                                                // producción)
                .build();

        AbstractXMPPConnection connection = new XMPPTCPConnection(config);
        try {
            connection.connect();
            connection.login();
            System.out.println("Conexión establecida con éxito!");
        } catch (SmackException | XMPPException | InterruptedException e) {
            e.printStackTrace();
        } finally {
            connection.disconnect();
        }
    }
}
