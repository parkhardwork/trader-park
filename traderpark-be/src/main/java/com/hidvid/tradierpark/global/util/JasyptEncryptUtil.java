package com.hidvid.tradierpark.global.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

/**
 * Jasypt 암호화 유틸리티 클래스
 * 
 * 사용법:
 * 1. 터미널에서 실행: cd traderpark-be
 * 2. ./gradlew bootRun --args='--jasypt.encryptor.password=YOUR_SECRET_PASSWORD'
 * 3. 또는 IDE에서 실행 시 VM Options: -Djasypt.encryptor.password=YOUR_SECRET_PASSWORD
 * 4. 암호화된 값을 application.yaml에 ENC(암호화된값) 형태로 사용
 */
public class JasyptEncryptUtil {

    public static void main(String[] args) {
        String password = "w7mP#9xL$2nQ@5vR!8tY&4wE^3zA*6bC"; // 실제 사용 시 환경변수나 파라미터로 전달
        String plainText = "h6wV7B6PJeDa_hv7HFuKbtvaOzwIKU-gtoQXEzyxm68"; // 암호화할 평문

        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        config.setPassword(password);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);

        String encrypted = encryptor.encrypt(plainText);
        String decrypted = encryptor.decrypt(encrypted);

        System.out.println("========================================");
        System.out.println("평문: " + plainText);
        System.out.println("암호화: " + encrypted);
        System.out.println("복호화: " + decrypted);
        System.out.println("========================================");
        System.out.println("application.yaml에 다음과 같이 사용:");
        System.out.println("app-key: ENC(" + encrypted + ")");
        System.out.println("========================================");
    }
}
