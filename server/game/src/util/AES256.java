package util;

/**
 * @author chieuvh
 */

import org.apache.commons.codec.binary.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class AES256
{

    public static String toBase64 (byte[] data)
    {
        String sBase64 = Base64.encodeBase64URLSafeString(data);
        return sBase64;
    }

    public static byte[] fromBase64 (String sBase64)
    {
        return Base64.decodeBase64(sBase64);
    }

    public static String encrypt (String keyInStr, String dataToEncrypt) throws Exception
    {

        String vectorInStr = getKey(keyInStr);
        byte[] keyInBinary = vectorInStr.getBytes();
        byte[] vectorInBinary = vectorInStr.getBytes();

        SecretKeySpec secretKeySpec = new SecretKeySpec(keyInBinary, "AES");
        IvParameterSpec ivspec = new IvParameterSpec(vectorInBinary);

        Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
        c.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivspec);

        byte[] encryptedData = c.doFinal(dataToEncrypt.getBytes("UTF-8"));
        String sResultInBase64 = toBase64(encryptedData);

        return sResultInBase64;
    }

    public static String decrypt (String keyInStr, String cipherText)
            throws NoSuchAlgorithmException,
            InvalidKeyException,
            IllegalBlockSizeException,
            UnsupportedEncodingException,
            NoSuchPaddingException,
            InvalidAlgorithmParameterException,
            BadPaddingException
    {

        String vectorInStr = getKey(keyInStr);
        byte[] keyInBinary = vectorInStr.getBytes();
        byte[] vectorInBinary = vectorInStr.getBytes();

        SecretKeySpec secretKeySpec = new SecretKeySpec(keyInBinary, "AES");
        IvParameterSpec ivspec = new IvParameterSpec(vectorInBinary);

        Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
        c.init(Cipher.DECRYPT_MODE, secretKeySpec, ivspec);

        byte[] decrypted = c.doFinal(fromBase64(cipherText));
        String sResult = new String(decrypted, "UTF-8");

        return sResult;
    }

    private static String getKey (String key)
    {
        if (key == null)
        {
            throw new IllegalArgumentException("key = null");
        }
        if (key.length() == 16)
        {
            return key;
        }
        if (key.length() > 16)
        {
            return key.substring(0, 16);
        }
        return (key + key).substring(0, 16);

    }
}
