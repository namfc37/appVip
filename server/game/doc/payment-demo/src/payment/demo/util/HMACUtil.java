/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo.util;

/**
 *
 * @author huy
 */
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.Locale;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base64;

/**
 * This class will help you a HMAC string by calculating a message
 * authentication code (MAC) involving a cryptographic hash function in
 * combination with a secret cryptographic key.
 *
 * @author YenNLH
 *
 */
public class HMACUtil {

    // @formatter:off
    public final static String HMACMD5 = "HmacMD5";
    public final static String HMACSHA1 = "HmacSHA1";
    public final static String HMACSHA256 = "HmacSHA256";
    public final static String HMACSHA512 = "HmacSHA512";
    public final static Charset UTF8CHARSET = Charset.forName("UTF-8");

    public final static LinkedList<String> HMACS = new LinkedList<String>(Arrays.asList("UnSupport", "HmacSHA256", "HmacMD5", "HmacSHA384", "HMacSHA1", "HmacSHA512"));
    // @formatter:on

    private static byte[] HMacEncode(final String algorithm, final String key, final String data) {
        Mac macGenerator = null;
        try {
            macGenerator = Mac.getInstance(algorithm);
            SecretKeySpec signingKey = new SecretKeySpec(key.getBytes("UTF-8"), algorithm);
            macGenerator.init(signingKey);
        } catch (Exception ex) {
        }

        if (macGenerator == null) {
            return null;
        }

        byte[] dataByte = null;
        try {
            dataByte = data.getBytes("UTF-8");
        } catch (UnsupportedEncodingException e) {
        }

        return macGenerator.doFinal(dataByte);
    }

    /**
     * Calculating a message authentication code (MAC) involving a cryptographic
     * hash function in combination with a secret cryptographic key.
     *
     * The result will be represented base64-encoded string.
     *
     * @param algorithm A cryptographic hash function (such as MD5 or SHA-1)
     *
     * @param key A secret cryptographic key
     *
     * @param data The message to be authenticated
     *
     * @return Base64-encoded HMAC String
     */
    public static String HMacBase64Encode(final String algorithm, final String key, final String data) {
        byte[] hmacEncodeBytes = HMacEncode(algorithm, key, data);
        if (hmacEncodeBytes == null) {
            return null;
        }
        return new Base64().encodeToString(hmacEncodeBytes);
    }

    /**
     * Calculating a message authentication code (MAC) involving a cryptographic
     * hash function in combination with a secret cryptographic key.
     *
     * The result will be represented hex string.
     *
     * @param algorithm A cryptographic hash function (such as MD5 or SHA-1)
     *
     * @param key A secret cryptographic key
     *
     * @param data The message to be authenticated
     *
     * @return Hex HMAC String
     */
    public static String HMacHexStringEncode(final String algorithm, final String key, final String data) {
        byte[] hmacEncodeBytes = HMacEncode(algorithm, key, data);
        if (hmacEncodeBytes == null) {
            return null;
        }
        return byteArrayToHexString(hmacEncodeBytes);
    }
    static final byte[] HEX_CHAR_TABLE = {
        (byte) '0', (byte) '1', (byte) '2', (byte) '3',
        (byte) '4', (byte) '5', (byte) '6', (byte) '7',
        (byte) '8', (byte) '9', (byte) 'a', (byte) 'b',
        (byte) 'c', (byte) 'd', (byte) 'e', (byte) 'f'
    };
    // @formatter:on

    /**
     * Convert a byte array to a hexadecimal string
     *
     * @param raw A raw byte array
     *
     * @return Hexadecimal string
     */
    public static String byteArrayToHexString(byte[] raw) {
        byte[] hex = new byte[2 * raw.length];
        int index = 0;

        for (byte b : raw) {
            int v = b & 0xFF;
            hex[index++] = HEX_CHAR_TABLE[v >>> 4];
            hex[index++] = HEX_CHAR_TABLE[v & 0xF];
        }
        return new String(hex);
    }

    /**
     * Convert a hexadecimal string to a byte array
     *
     * @param raw A hexadecimal string
     *
     * @return The byte array
     */
    public static byte[] hexStringToByteArray(String hex) {
        String hexstandard = hex.toLowerCase(Locale.ENGLISH);
        int sz = hexstandard.length() / 2;
        byte[] bytesResult = new byte[sz];

        int idx = 0;
        for (int i = 0; i < sz; i++) {
            bytesResult[i] = (byte) (hexstandard.charAt(idx));
            ++idx;
            byte tmp = (byte) (hexstandard.charAt(idx));
            ++idx;

            if (bytesResult[i] > HEX_CHAR_TABLE[9]) {
                bytesResult[i] -= ((byte) ('a') - 10);
            } else {
                bytesResult[i] -= (byte) ('0');
            }
            if (tmp > HEX_CHAR_TABLE[9]) {
                tmp -= ((byte) ('a') - 10);
            } else {
                tmp -= (byte) ('0');
            }

            bytesResult[i] = (byte) (bytesResult[i] * 16 + tmp);
        }
        return bytesResult;
    }
}
