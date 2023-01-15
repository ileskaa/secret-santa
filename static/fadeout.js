import {wrapper, timer, arrLen, showNext} from './functions.js';

const button = document.getElementsByClassName('button')[0];

function fadeOut() {
    const txt = document.getElementById("hoho");
    const welcome = document.getElementById("welcome");
    wrapper(txt);

    setTimeout(() => {
        txt.style.display = 'none';
        wrapper(welcome, 'reveal');
    }, timer*arrLen);

    setTimeout(() => {
        button.style.display = 'block';
        button.addEventListener('click', showNext);
        wrapper(button, 'reveal');
    }, timer*arrLen+1000);
};

export {fadeOut};