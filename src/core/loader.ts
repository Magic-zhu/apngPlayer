function loadUrl(url: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      if (this.status == 200) {
        resolve(this.response);
      } else {
        reject(this);
      }
    };
    xhr.onerror = function () {
      reject(this);
    };
    xhr.send();
  });
}

export default loadUrl;
