let offsetX = 0;
let offsetY = 0;
let lastX = 0;
let lastY = 0;

/**
 * Image loading handler, it loads the image and create a canvas layer on top to draw the mask
 * @param {File} e 
 */
const createMaskEditorForFile = (e, reader, imageContainer) => {
    let isDrawing = false;
    lastX = 0;
    lastY = 0;

    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    const originalImage = new Image();
    const img = new Image();
    
    img.style = 'position: absolute;';
    img.onload = () => {
      console.log("image loaded");
      //Clean
      imageContainer.innerHTML = '';

      //Creating a new canvas to draw the mask on it
      canvas = document.createElement('canvas');
      canvas.style = 'position: relative; opacity: 0.5';
      canvas.id = 'canvas';
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      
      if (window.innerWidth < window.minWindowSize) {
        const containerWidth = imageContainer.offsetWidth - 4; // Subtract 4px for the border
        img.width = containerWidth;
        img.height = (containerWidth / originalImage.width) * originalImage.height;
        canvas.width = containerWidth;
        canvas.height = img.height;
      }

      function convertToBlackAndWhite(imageData) {
          const data = imageData.data;
          // Threshold value for black and white conversion
          const threshold = 128;
          // Loop through each pixel and convert it to black or white
          for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Calculate the average of RGB values
              if (avg > threshold) {
                  // Set the pixel to white (255)
                  data[i] = 255;
                  data[i + 1] = 255;
                  data[i + 2] = 255;
              } else {
                  // Set the pixel to black (0)
                  data[i] = 0;
                  data[i + 1] = 0;
                  data[i + 2] = 0;
              }

          }
          return imageData;
      }

      function startDrawing(e) {
          isDrawing = true;
          const rect = canvas.getBoundingClientRect();
          lastX = e.clientX - rect.left;
          lastY = e.clientY - rect.top;
      }

      function drawOnCanvas(e) {
          if (!isDrawing) return;
          //ctx.strokeStyle = '#000';
          ctx.strokeStyle = `rgba(0, 0, 0, ${window.strokeSize})`;
          ctx.lineCap = 'round';
          ctx.lineWidth = window.strokeSize;
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          const rect = canvas.getBoundingClientRect();
          lastX = e.clientX - rect.left;
          lastY = e.clientY - rect.top;
          ctx.lineTo(lastX, lastY);
          ctx.stroke();
      }

      function stopDrawing() {
          isDrawing = false;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const convertedImageData = convertToBlackAndWhite(imageData);
          ctx.putImageData(convertedImageData, 0, 0);
          ctx.closePath();
          /**
           * Update the mask into the APIPayload 
           */
          APIPayload.Body.mask = getBase64FromCanvas(canvas);
          updateAPIPayloadView();
      }

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', drawOnCanvas);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);
      
      // Add touch event listeners
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
      });
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        drawOnCanvas({ clientX: touch.clientX, clientY: touch.clientY });
      });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing);

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, img.width, img.height);
      imageContainer.appendChild(img);
      imageContainer.appendChild(canvas);
      
      // window.addEventListener('resize', () => {
      //   console.log('window resize, adjusting image and canvas');
      //   if (window.innerWidth < window.minWindowSize) {
      //     const containerWidth = imageContainer.offsetWidth - 4; // Subtract 4px for the border
      //     img.width = containerWidth;
      //     img.height = (containerWidth / originalImage.width) * originalImage.height;
      //     canvas.width = containerWidth;
      //     canvas.height = img.height;
      //     ctx.clearRect(0, 0, canvas.width, canvas.height);
      //     ctx.fillStyle = '#fff';
      //     ctx.fillRect(0, 0, canvas.width, canvas.height);
      //   }
      // });
    };
    
    originalImage.src = url;
    originalImage.onload = async () => {
        if(originalImage.width > imageContainer.offsetWidth-4){
            console.log('Scaling image down before loading')
            const scaledImageURL = scaleDownImage(originalImage, window.imageMaxSize > imageContainer.offsetWidth? imageContainer.offsetWidth-4: window.imageMaxSize);
            img.src = scaledImageURL;
        }else{
            img.src = url;
        }
        reader.readAsDataURL( await convertImageToBlob(img.src));
    };
}

/**
 * Function to scale down images
 */
const scaleDownImage = (img, desiredWidth) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scale = desiredWidth/img.width
    
    const newWidth = Math.floor(img.width * scale);
    const newHeight = Math.floor(img.height * scale);
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    return canvas.toDataURL('image/jpeg', 0.7); // Returns the scaled-down image as a data URL
}

const convertImageToBlob = (imgSrc) => {
  return new Promise((resolve, reject) => {
    // Create a new image object
    const img = new Image();

    // Set the image source
    img.src = imgSrc;

    // Wait for the image to load
    img.onload = function() {
      // Create a canvas element
      const canvas = document.createElement('canvas');

      // Set the canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Get the 2D rendering context of the canvas
      const ctx = canvas.getContext('2d');

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a Blob
      canvas.toBlob(function(blob) {
        // Resolve the Promise with the Blob
        resolve(blob);
      }, 'image/png');
    };

    // Handle image loading errors
    img.onerror = function() {
      reject(new Error('Error loading image: ' + imgSrc));
    };
  });
}