document.addEventListener('keydown', function(event) {
    const key = event.key;
    const currentPath = window.location.pathname;
    const slideNumberMatch = currentPath.match(/slide(\d+)\.html/);

    if (key === 'h' || key === 'H') {
        window.location.href = 'index.html';
        return;
    }

    if (!slideNumberMatch) {
        if (key === 'ArrowRight') {
            window.location.href = 'slide1.html';
        }
        return;
    }

    const currentSlideNumber = parseInt(slideNumberMatch[1], 10);
    let nextSlideNumber;

    if (key === 'ArrowRight') {
        nextSlideNumber = currentSlideNumber + 1;
        if (nextSlideNumber > 16) { 
            return;
        }
        window.location.href = `slide${nextSlideNumber}.html`;
    } else if (key === 'ArrowLeft') {
        nextSlideNumber = currentSlideNumber - 1;
        if (nextSlideNumber < 1) {
            window.location.href = 'index.html';
            return;
        }
        window.location.href = `slide${nextSlideNumber}.html`;
    }
});