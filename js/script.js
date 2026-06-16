/** *****************************
 * Step Zero Cognito authentication
 ***************************** **/
 var auth_atempt = 0;
 document.getElementById('loginBtn').addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Auth atempt:", auth_atempt++);
    toggleVisibility('login-spinner');
    document.getElementById('loginFormMessages').style.display = 'none';
    authenticate(document.getElementById('cognito-username').value, document.getElementById('cognito-password').value)
    .then((result) => {
        APIPayload.Headers.Authorization = result;
        updateAPIPayloadView();
        toggleVisibility('login-spinner');
        toggleVisibility('loginFormMessages');
    }).catch((e) => {
        console.error(JSON.stringify(e, null, 2));
        alert(e);
        toggleVisibility('login-spinner');
    });
});


/** *****************************
 * Step 1 Elements and functions
 ***************************** **/
const reader = new FileReader();
/**
 * When an image is loaded, this function is called and the base64 is stored for further use
 */
reader.onload = function() {
    APIPayload.Body.base_image = reader.result;
    updateAPIPayloadView()
}
const fileInput = document.getElementById('file-input');
const imageContainer = document.getElementById('image-container');
fileInput.addEventListener('change', (e) => { createMaskEditorForFile(e, reader, imageContainer)});

/** *****************************
 * Step 2 Elements
 ***************************** **/
const prompt = document.getElementById('prompt');
const mode = document.getElementById('mode');
const sendAPIRequestBtn = document.getElementById('sendAPIRequestBtn');
sendAPIRequestBtn.addEventListener('click', () => {
    //Cleaning error messages
    document.getElementById('error_messages').style.display = 'none';
    document.getElementById('dbg_errors').innerHTML = "";
    
    //show loading
    toggleVisibility('spinner');
    
    // disable the button
    sendAPIRequestBtn.setAttribute('disabled', 'disabled');
    
    sendPostRequest(window._config.api.invokeUrl, APIPayload.Body, APIPayload.Headers).then((response) => {
        toggleVisibility('spinner');
        sendAPIRequestBtn.removeAttribute('disabled');
        
        const canvasContainer = document.getElementById("response-canvas-container");
        canvasContainer.innerHTML = ''; // Clear previous canvases
        
        if (response.images.length > 0) {
            let compositeCanvas = document.createElement("canvas");
            let compositeContext = compositeCanvas.getContext("2d");
    
            const loadAndDrawImageOnCanvas = (base64Image, canvas, context) => {
                let image = new Image();
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0);
                    canvasContainer.appendChild(canvas);
                };
                image.src = 'data:image/png;base64,' + base64Image;
            };
    
            // Load and draw the first image on the composite canvas
            loadAndDrawImageOnCanvas(response.images[0], compositeCanvas, compositeContext);
    
            // Load and draw the subsequent images on top of the composite canvas
            for (let i = 1; i < response.images.length; i++) {
                let temporaryCanvas = document.createElement("canvas");
                let temporaryContext = temporaryCanvas.getContext("2d");
    
                loadAndDrawImageOnCanvas(response.images[i], temporaryCanvas, temporaryContext);
    
                // Wait for the image to load before drawing it on the composite canvas
                temporaryCanvas.addEventListener('load', () => {
                    compositeContext.drawImage(temporaryCanvas, 0, 0);
                });
            }
        }
    }).catch((error_response) => {
        // Scroll to the top of the page
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        let error_box = document.getElementById('dbg_errors');
        error_box.innerHTML = `Code: ${error_response.code} <br>Message: ${error_response.message}`;
        toggleVisibility('spinner');
        toggleVisibility('error_messages');
        sendAPIRequestBtn.removeAttribute('disabled');
    });
})

/** *****************************
 * Step 3 Elements
 ***************************** **/
const getImageBtn = document.getElementById('getImageBtn');

/**
 * Debug view is populated with the APIPayload default values
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Update the APIPayload.prompt.text everytime the prompt imput changes
     */
    prompt.addEventListener('input', (e) => {
        APIPayload.Body.prompt.text = e.target.value;
        updateAPIPayloadView();
    });

    /**
     * Update the APIPayload.prompt.mode everytime the mode imput changes
     */
    mode.addEventListener('change', (e) => {
        APIPayload.Body.prompt.mode = e.target.value;
        updateAPIPayloadView();
    });

    /**
     * By default, the APIPayload.prompt.mode should be set with the first value in the mode select element
     */
    APIPayload.Body.prompt.mode = mode.value;
    APIPayload.Body.prompt.text = prompt.value;
    updateAPIPayloadView();
    
    fileInput.value = '';
    
    /**
     * Detect Enter key on cognito password
     * */
    document.getElementById('cognito-password').addEventListener('keyup', (e) => {
        e.preventDefault();
        if(e.key == 'Enter'){
            console.log(e);
            document.getElementById('loginBtn').click();
        }
    });
    
    /**
     * Download generated images
     */
    document.getElementById('getImageBtn').addEventListener('click', (e => {
        e.preventDefault();
        const container = document.getElementById('response-canvas-container');
        const canvases = container.getElementsByTagName('canvas');
        // Loop through each canvas element
        for (let i = 0; i < canvases.length; i++) {
            downloadCanvas(canvases[i], i)
        }
        document.getElementById('downloadMessage').style.display = 'inline';
        setTimeout(() => { document.getElementById('downloadMessage').style.display = 'none'}, 2000);
    }))
    
    const strokeIndicator = document.getElementById('strokeSizeIndicator');
    strokeIndicator.innerHTML = window.strokeSize;
    
    strokeIndicator.addEventListener('change', (e) => {
        
    })
    
    document.getElementById('btnDecreaseStroke').addEventListener('click', (e) => {
        e.preventDefault();
        window.strokeSize--;
        strokeIndicator.innerHTML = window.strokeSize;
    });
    
    document.getElementById('btnIncreaseStroke').addEventListener('click', (e) => {
        e.preventDefault();
        window.strokeSize++;
        strokeIndicator.innerHTML = window.strokeSize;
    });
    
    // Get the error message box element
    const errorMessageBox = document.getElementById('error_messages');
    const dismissButton = document.getElementById("errorDismissBtn");
    dismissButton.addEventListener('click', () => {
        errorMessageBox.style.display = 'none';
    })
    // Check if touch events are supported
    if ('ontouchstart' in window) {
      // Store touch start position
      let touchStartY;
      // Add touch start event listener
      errorMessageBox.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
      });
      errorMessageBox.addEventListener('touchmove', (event) => {
        // Prevent default touch behavior
        event.preventDefault();
      });
      // Add touch end event listener
      errorMessageBox.addEventListener('touchend', (event) => {
        // Get touch end position
        const touchEndY = event.changedTouches[0].clientY;
        // Calculate swipe distance
        const swipeDistance = touchStartY - touchEndY;
        // Check if the swipe was upwards and the screen size is less than 900 pixels
        if (swipeDistance > 0 && window.innerWidth < window.minWindowSize) {
          // Hide the error message box
          errorMessageBox.style.display = 'none';
        }
      });
    }else{
        dismissButton.innerHTML = "Click here to dimiss";
    }
});