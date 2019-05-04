/**
 * Created by zhaowenyang on 2018/6/23.
 */
// 参考 https://github.com/darknessomi/musicbox/wiki/
'use strict';
var modulus =
    '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
var nonce = '0CoJUm6Qyw8W8jud';
var pubKey = '010001';
var eapiKey = 'e82ckenh8dichen8';// eapi key
var eapiHeader = {
    "os": "osx",
    "appver": "2.0.0",
    "deviceId": "F7F5C832-AAA2-5F6C-B8EF-1E93418997EB%7CC07BA6B7-F6DC-4568-9ACB-CD9D93696C04",
    "requestId": "43130936",
    "clientSign": "",
    "osver": "%E7%89%88%E6%9C%AC%2010.14.2%EF%BC%88%E7%89%88%E5%8F%B7%2018C54%EF%BC%89",
    "batch-method": "GET",
    "MUSIC_U": "90be07dfdedff92341c78118ea3344419eb4ece7111f30d4d305455650241e96d23b891712eeae35076e52ac8293123e1ec6c98d5a31c49ba70b41177f9edcea"
};

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
// weapi encrypt
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
// eapi encrypt
function EAPI(path, object) {
    var text = JSON.stringify(Object.assign(object, {e_r: 'false'}));
    var message = 'nobody'+ path +'use'+ text +'md5forencrypt';
    var digest = CryptoJS.MD5(message).toString();
    var data = path +'-36cd479b6b5-'+ text +'-36cd479b6b5-'+ digest;
    var params = encodeURIComponent(aesEncrypt(data, eapiKey, '', 'ECB').ciphertext.toString().toUpperCase());
    return {
        params: params
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
