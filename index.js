/**
 * Created by zhaowenyang on 2018/6/23.
 */
// 参考 https://github.com/darknessomi/musicbox/wiki/
'use strict';
var modulus =
    '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
var nonce = '0CoJUm6Qyw8W8jud';
var pubKey = '010001';

function createSecretKey(size) {
    var keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var key = '';
    for (var i = 0; i < size; i++) {
        var pos = Math.random() * keys.length;
        pos = Math.floor(pos);
        key = key + keys.charAt(pos);
    }
    return key;
}

function aesEncrypt(text, secKey) {
    var _text = CryptoJS.enc.Utf8.parse(text);
    var _secKey = CryptoJS.enc.Utf8.parse(secKey);
    var lv = CryptoJS.enc.Utf8.parse('0102030405060708');
    var encrypted = CryptoJS.AES.encrypt(_text, _secKey, { iv: lv, mode: CryptoJS.mode.CBC});
    return encrypted.toString();
}

function zfill(str, size) {
    while (str.length < size) str = '0' + str;
    return str;
}

function rsaEncrypt(text, pubKey, modulus) {
    var _text = text.split('').reverse().join('');
    var biText = bigInt(CryptoJS.enc.Utf8.parse(_text).toString(), 16),
        biEx = bigInt(pubKey, 16),
        biMod = bigInt(modulus, 16),
        biRet = biText.modPow(biEx, biMod);
    // Math.pow(int(binascii.hexlify(text), 16), int(pubkey, 16), int(modulus, 16));
    return zfill(biRet.toString(16), 256);
}

function Encrypt(obj) {
    var text = JSON.stringify(obj);
    var secKey = createSecretKey(16);
    console.log("secKey is: " + secKey);

    var encText = aesEncrypt(aesEncrypt(text, nonce), secKey);
    var encSecKey = rsaEncrypt(secKey, pubKey, modulus);
    console.log({params: encText, encSecKey: encSecKey});
    return {
        params: encText,
        encSecKey: encSecKey
    }
}

var data = {
        offset: 0,
        uid: "36483032",
        limit: 30,
        csrf_token: ""
    };

Encrypt(data);

// module.exports = Encrypt
