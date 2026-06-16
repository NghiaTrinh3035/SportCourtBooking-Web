package com.sportbooking.backend_sportcourtbooking.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class VnPayUtil {

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getPaymentURL(Map<String, String> paramsMap, boolean encodeKey) {
        return hashAllFields(paramsMap, null);
    }

    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (secretKey == null) {
                    sb.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                    sb.append('=');
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                } else {
                    sb.append(fieldName);
                    sb.append('=');
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                }
                if (itr.hasNext()) {
                    sb.append('&');
                }
            }
        }
        if (secretKey != null) {
            return hmacSHA512(secretKey, sb.toString());
        }
        return sb.toString();
    }
}
