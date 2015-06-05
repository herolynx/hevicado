package com.kunishu.core.security

import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import org.apache.commons.codec.binary.Hex

/**
 * Encryption related functionality
 *
 * @author Michal Wronski
 * @since 1.0
 */
object Encryption {

  private val secretKey = "#lksa9826@msohj7356!kchk0782"
  private val algorithmName: String = "HmacSHA256"
  private val encoding = "UTF-8"

  private def mac: Mac = {
    val secret = new SecretKeySpec(secretKey.getBytes(encoding), algorithmName)
    val mac = Mac.getInstance(algorithmName)
    mac.init(secret)
    return mac
  }

  /**
   * Hash given value
   * @param value value to be encrypted
   * @return encoded value
   */
  def hash(value: String): String = new String(Hex.encodeHex(mac.doFinal(value.getBytes(encoding))))

}
