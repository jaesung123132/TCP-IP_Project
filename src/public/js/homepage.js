const contentSections = document.querySelectorAll('.content');

contentSections.forEach(section => {
    const leftArrow = section.querySelector('.left-arrow');
    const rightArrow = section.querySelector('.right-arrow');
    const listBox = section.querySelector('.list-box');

    if (!leftArrow || !rightArrow || !listBox) {
        return;
    }

    const updateButtonState = () => {
        const scrollLeft = listBox.scrollLeft;
        const maxScrollLeft = listBox.scrollWidth - listBox.clientWidth;

        if (scrollLeft <= 0) {
            leftArrow.classList.add('disabled');
        } else {
            leftArrow.classList.remove('disabled');
        }

        if (scrollLeft >= maxScrollLeft - 1) {
            rightArrow.classList.add('disabled');
        } else {
            rightArrow.classList.remove('disabled');
        }
    };

    rightArrow.addEventListener('click', () => {
        listBox.scrollBy({ left: 300, behavior: 'smooth' });
    });

    leftArrow.addEventListener('click', () => {
        listBox.scrollBy({ left: -300, behavior: 'smooth' });
    });

    listBox.addEventListener('scroll', updateButtonState);

    updateButtonState();
});