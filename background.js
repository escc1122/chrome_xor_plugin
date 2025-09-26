// 建立右鍵選單
chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "xor-display-link",
    title: "XOR 後顯示",
    contexts: ["link"]
  });
});

// XOR 函數
function xorBytes(bytes) {
  const key = 168;
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] ^= key;
  }
  return bytes;
}

// ArrayBuffer -> 文字
function arrayBufferToBinaryString(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

// 通用處理函數
function fetchAndXOR(url) {
  return fetch(url)
    .then(resp => {
      if (!resp.ok) throw new Error('Fetch 失敗: ' + resp.status);
      return resp.arrayBuffer();
    })
    .then(arrayBuffer => {
      const bytes = new Uint8Array(arrayBuffer);
      xorBytes(bytes);
      const text = arrayBufferToBinaryString(bytes.buffer);

      const encoded = encodeURIComponent(text);
      const dataUrl = 'data:text/plain;charset=utf-8,' + encoded;

      chrome.tabs.create({ url: dataUrl });
    });
}

// 右鍵觸發
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId !== "xor-display-link") return;
  const url = info.linkUrl;
  if (!url) return;

  fetchAndXOR(url).catch(err => console.error('處理失敗：', err));
});

// 提供 popup.js 呼叫
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetchXOR' && message.url) {
    fetchAndXOR(message.url)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // 保持 async 回應
  }
});
