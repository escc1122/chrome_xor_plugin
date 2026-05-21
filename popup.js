document.getElementById('fetchBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return alert('請輸入網址');

  chrome.runtime.sendMessage({ action: 'fetchXOR', url }, (response) => {
    if (!response.success) {
      alert('下載或 XOR 失敗：' + response.error);
    }
  });
});

document.getElementById('fileBtn').addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert('請選擇檔案');

  const reader = new FileReader();
  reader.onload = () => {
    const bytes = new Uint8Array(reader.result);
    const key = 168;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= key;
    }
    let text = '';
    for (let i = 0; i < bytes.length; i++) {
      text += String.fromCharCode(bytes[i]);
    }
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    chrome.tabs.create({ url: dataUrl });
  };
  reader.onerror = () => alert('讀取檔案失敗');
  reader.readAsArrayBuffer(file);
});
