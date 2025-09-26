document.getElementById('fetchBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return alert('請輸入網址');

  chrome.runtime.sendMessage({ action: 'fetchXOR', url }, (response) => {
    if (!response.success) {
      alert('下載或 XOR 失敗：' + response.error);
    }
  });
});
