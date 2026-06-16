/**
 * Global functions and variables
 */
const APIPayload = {
    "Headers": {
        "Content-Type": "application/json",
        "Authorization": ""
    },
    "Body":{
        "prompt": {
            "text": null,
            "mode": null,
        },
        "mask": null,
        "base_image": null
    }
    
}

/**
 * Pointer size by default
 */
 window.strokeSize = 50;
 
 /**
  * Max size of the image to be rendered before being scaled down
  */
 window.imageMaxSize = 768;

/**
 * Min window size to trigger the resizing of the canvas
 */
 window.minWindowSize = 920;

/**
 * Function to be called every time APIPayload object is updated
 */
const updateAPIPayloadView = () => {
    const codeTag = document.getElementById('dbg_view');
    const payload = JSON.stringify(APIPayload, null, 2);
    const highlightedPayload = payload.replace(/"Authorization": (null|"[^"]*")/g, `"Authorization": <span>$1</span>`)
        .replace(/"text": (null|"[^"]*"),/g, `"text": <span>$1</span>,`)
        .replace(/"mode": (null|"[^"]*")/g, `"mode": <span>$1</span>`)
        .replace(/"mask": (null|"[^"]*"),/g, `"mask": <span>$1</span>,`)
        .replace(/"base_image": (null|"[^"]*")/g, `"base_image": <span>$1</span>`);

    codeTag.innerHTML = highlightedPayload.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
}

/**
 * Function to return the base64 from the canvas element
 */
const getBase64FromCanvas = (canvas) => {
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
}

/**Function to download the image from the canvas */
const downloadCanvas = (canvas, index = 0) => {
    console.log('download canvas');
    const link = document.createElement('a');
    link.download = `image_${index}.png`;
    link.href = getBase64FromCanvas(canvas);
    link.click();
}   

/**
 * Function to hide and show HTML elements
 */
const toggleVisibility = (elementId) => {
  var element = document.getElementById(elementId);
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

/**
 * Function to disable and enable HTML elements
 */
const toggleDisabled = (elementId) => {
  var element = document.getElementById(elementId);
  element.disabled = !element.disabled;
}