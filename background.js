// background.js
// 右鍵點擊連結 -> XOR -> 在新分頁顯示文字（data URL）

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "xor-display-link",
    title: "XOR 後顯示 JSON",
    contexts: ["link"]
  });
});

function xorBytes(bytes) {
  var key = 168;
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = bytes[i] ^ key;
  }
  return bytes;
}

// 將 ArrayBuffer 轉成文字
function arrayBufferToBinaryString(buffer) {
  var bytes = new Uint8Array(buffer);
  var str = '';
  for (var i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId !== "xor-display-link") return;
  var url = info.linkUrl;
  if (!url) return;

  fetch(url).then(function(resp) {
    if (!resp.ok) throw new Error("Fetch 失敗: " + resp.status);
    return resp.arrayBuffer();
  }).then(function(arrayBuffer) {
    var bytes = new Uint8Array(arrayBuffer);
    xorBytes(bytes);
    var text = arrayBufferToBinaryString(bytes.buffer);

    // 將文字轉成 data URL
    var encoded = encodeURIComponent(text);
    var dataUrl = 'data:text/plain;charset=utf-8,' + encoded;

    // 新分頁顯示
    chrome.tabs.create({ url: dataUrl });

  }).catch(function(err) {
    console.error("處理失敗：", err);
  });
});
