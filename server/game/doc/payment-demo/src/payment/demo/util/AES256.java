/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package payment.demo.util;

/**
 *
 * @author chieuvh
 */
import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base64;

public class AES256 {

    public String toBase64(byte[] data) {
        String sBase64 = Base64.encodeBase64URLSafeString(data);
        return sBase64;
    }

    public byte[] fromBase64(String sBase64) {
        return Base64.decodeBase64(sBase64);
    }

    public String encrypt(String keyInStr, String dataToEncrypt) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException, IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException {

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

    public String decrypt(String keyInStr, String cipherText)
            throws NoSuchAlgorithmException,
            InvalidKeyException,
            IllegalBlockSizeException,
            UnsupportedEncodingException,
            NoSuchPaddingException,
            InvalidAlgorithmParameterException,
            BadPaddingException {

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

    private String getKey(String key) {
        if (key == null) {
            throw new IllegalArgumentException("key = null");
        }
        if (key.length() == 16) {
            return key;
        }
        if (key.length() > 16) {
            return key.substring(0, 16);
        }
        return (key + key).substring(0, 16);

    }

    public static void main(String[] args) throws Exception {
        AES256 al = new AES256();
        String textToEncrypt = "DV kiểm tra giúp em TH sau:KH sử dụng số 986162874 p/a mua thẻ có serial 22761727067 vào ngày 22/08/2016 15:53:33 nhưng khi nạp xong kiểm tra TK game chưa có.";
        String textAfterEncrypt = al.encrypt("abc123456789def1", textToEncrypt);
        System.out.println(textAfterEncrypt);
        String textFromDecrypt = al.decrypt("abc123456789def1", textAfterEncrypt);
        System.out.println(textFromDecrypt);
        System.out.println(textToEncrypt.compareTo(textFromDecrypt));
    }
}
