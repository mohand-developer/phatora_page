document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const productImage = document.getElementById('productImage');
    const placeholderText = document.getElementById('placeholderText');
    const scaleControl = document.getElementById('scaleControl');
    const posXControl = document.getElementById('posXControl');
    const posYControl = document.getElementById('posYControl');
    const downloadBtn = document.getElementById('downloadBtn');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const adTemplate = document.getElementById('adTemplate');
    const loader = document.getElementById('loader');

    let currentScale = 1;
    let currentPosX = 0;
    let currentPosY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let originalImageBlob = null; // Store the original file for processing

    // Handle Image Upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            originalImageBlob = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                productImage.src = e.target.result;
                productImage.classList.remove('hidden');
                placeholderText.style.display = 'none';

                // Enable Magic Button
                removeBgBtn.disabled = false;

                // Reset controls
                scaleControl.value = 100;
                posXControl.value = 0;
                posYControl.value = 0;
                currentScale = 1;
                currentPosX = 0;
                currentPosY = 0;
                updateTransform();
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Background Removal
    removeBgBtn.addEventListener('click', async () => {
        if (!originalImageBlob) return;

        try {
            // Show Loader
            loader.classList.remove('hidden');
            removeBgBtn.disabled = true;

            // Dynamically import the library
            // This prevents the whole script from failing if the environment (file://) blocks modules
            const { removeBackground } = await import("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.0/+esm");

            // Process image
            const blob = await removeBackground(originalImageBlob, {
                progress: (key, current, total) => {
                    console.log(`Downloading ${key}: ${current} of ${total}`);
                }
            });

            // Update Image source with new transparent image
            const url = URL.createObjectURL(blob);
            productImage.src = url;

            // Hide Loader
            loader.classList.add('hidden');
            removeBgBtn.disabled = false;

        } catch (error) {
            console.error("Background removal failed:", error);

            let msg = "حدث خطأ أثناء إزالة الخلفية.";
            if (window.location.protocol === 'file:') {
                msg += "\n\nالسبب: المتصفح يمنع تحميل مكتبات الذكاء الاصطناعي عند فتح الملف مباشرة (file://).\nيرجى فتح المجلد باستخدام VS Code Live Server أو رفع الملفات على استضافة.";
            } else {
                msg += "\nتأكد من اتصالك بالإنترنت.";
            }

            alert(msg);
            loader.classList.add('hidden');
            removeBgBtn.disabled = false;
        }
    });

    // Handle Controls
    scaleControl.addEventListener('input', (e) => {
        currentScale = e.target.value / 100;
        updateTransform();
    });

    posXControl.addEventListener('input', (e) => {
        currentPosX = parseInt(e.target.value);
        updateTransform();
    });

    posYControl.addEventListener('input', (e) => {
        currentPosY = parseInt(e.target.value);
        updateTransform();
    });

    function updateTransform() {
        productImage.style.transform = `translate(${currentPosX}px, ${currentPosY}px) scale(${currentScale})`;
    }

    // Drag Functionality
    adTemplate.addEventListener('mousedown', (e) => {
        if (productImage.classList.contains('hidden')) return;
        isDragging = true;
        startX = e.clientX - currentPosX;
        startY = e.clientY - currentPosY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        currentPosX = e.clientX - startX;
        currentPosY = e.clientY - startY;

        posXControl.value = currentPosX;
        posYControl.value = currentPosY;

        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Download Functionality
    downloadBtn.addEventListener('click', () => {
        html2canvas(adTemplate, {
            scale: 2,
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'mahfoor-ad-design.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Error generating image:", err);
            alert("حدث خطأ أثناء حفظ الصورة.");
        });
    });
});
