function sendPostRequest(endpoint, body, headers) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
  
      xhr.open('POST', endpoint, true);
  
      // Set headers
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
  
      // Set CORS headers
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token');
  
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          let response = {};
          try{
             response = JSON.parse(xhr.response).error? JSON.parse(xhr.response).error : JSON.parse(xhr.response).message;
          }catch(e){
             response = JSON.stringify(e);
          }
          reject({code: xhr.status, message: response});
        }
      };
  
      xhr.onerror = () => {
        reject({code: xhr.status, message:'An error occurred during the request.'});
      };
  
      xhr.send(JSON.stringify(body));
    });
  }