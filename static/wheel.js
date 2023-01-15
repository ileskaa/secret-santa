//Imeddiatly invoked function expression, to not pollute the global scope
(function(){
    const wheel = document.querySelector(`.wheel`);
    const startBtn = document.querySelector(`#wheel-btn`);
    let deg = 0;

    startBtn.addEventListener('click', () => {
        startBtn.style.pointerEvents = 'none';
        deg = Math.floor(5000 + Math.random() * 5000);
        console.log(deg);
        wheel.style.transition = 'all 10s ease-out';
        wheel.style.transform = `rotate(${deg}deg)`;
        wheel.classList.add('blur');
        startBtn.style.opacity = 0;
    });

    /* wheel.addEventListener('transitionend', () => { //every time we do a transition on the wheel, this will trigger when the transition has ended
        wheel.classList.remove('blur');
        startBtn.style.pointerEvents = 'auto';
        wheel.style.transition = 'none';
        const actualDeg = deg % 360;
        console.log(actualDeg);
        wheel.style.transform = `rotate(${actualDeg}deg)`;
    }); */
})();

const test = {integer};