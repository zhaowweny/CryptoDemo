/**
 * Created by zhaowenyang on 2018/6/23.
 */
// 参考 https://github.com/darknessomi/musicbox/wiki/
'use strict';
var modulus =
    '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
var nonce = '0CoJUm6Qyw8W8jud';
var pubKey = '010001';

function convert(str) {
    // var binary = "";
    // for (var i=0; i < str.length; i++) {
    //     binary += str[i].charCodeAt(0).toString(2) + " ";
    // }
    // return binary;
        return CryptoJS.enc.Utf8.parse(str).toString();

}

String.prototype.hexEncode = function() {
    var hex, i;
    var result = '';
    for (i = 0; i < this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ('' + hex).slice(-4);
    }
    return result
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
    var _text = text;
    // console.log(text);
    // console.log(secKey);

    // var lv = new Buffer('0102030405060708', 'binary');
    var lv = convert("0102030405060708");
    // var _secKey = new Buffer(secKey, 'binary');
    var _secKey = convert(secKey);
    // var cipher = CryptoJS.algo.AES.createEncryptor(_secKey, lv);
    // var cipher = CryptoJS.CipherParams.create();
    // var cipher = CryptoJS.Cipher('AES-128-CBC', _secKey, lv);
    // var encryptor = CryptoJS.algo.AES.createEncryptor(_secKey, lv);
    // var cipher = crypto.createCipheriv('AES-128-CBC', _secKey, lv);
    // var cipher = CryptoJS.AES.encrypt(_text, _secKey, { mode: CryptoJS.mode.CBC, iv: lv });
    // var encrypted = encryptor.encrypt(_text);
    var encrypted = CryptoJS.AES.encrypt(_text, _secKey, { iv: lv });
    // var encrypted = cipher.update(_text, 'utf8', 'base64');
    // encrypted += cipher.final('base64');
    encrypted += CryptoJS.enc.Base64.parse(encrypted.toString(CryptoJS.enc.Utf8));
    // var encrypted = CryptoJS.AES.encrypt(_text, _secKey, { iv: lv });
    return encrypted;
}

function zfill(str, size) {
    while (str.length < size) str = '0' + str;
    return str;
}

function binaryToAscii(text) {
    console.log(text);
    var regex = /[0|1]{8}/g;
    // var str = text.match(regex);
    var str = text;
    console.log(str);
    var code = 0;
    var placeVal, exp, digit;
    var ascii = '';
    while (str.length > 0) {
        code = 0;
        for (var i=0; i<str[0].length; i++) {
            placeVal = 7-i;
            exp = Math.pow(2, i);
            digit = str[0].charAt(placeVal);
            code += exp*digit;
        }
        // str.shift();
        ascii += String.fromCharCode(code);
    }
    return ascii;
}

//字符串转16进制

function strToHexCharCode(str) {
    if(str === "")
        return "";
    var hexCharCode = [];
    // hexCharCode.push("0x");
    for(var i = 0; i < str.length; i++) {
        hexCharCode.push((str.charCodeAt(i)).toString(16));
    }
    return hexCharCode.join("");
}

function rsaEncrypt(text, pubKey, modulus) {
    var _text = text.split('').reverse().join('');
    console.log(_text);
    console.log(convert(_text));
    console.log(convert(_text).hexEncode());
    var biText = bigInt(convert(_text).hexEncode(), 16),
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

// module.exports = Encrypt