const arrLen = 30;
const timer = 70;
const arr = Array.from(Array(arrLen).keys());
const reversed = arr.slice().reverse();
const decreasingOpacity = reversed.map(function(e) {
    e = e/arrLen;
    return e;
});
const increasingOpacity = arr.map(function(e) {
    e = e/arrLen;
    return e;
});

function wrapper(elt, mode='fadeout'){ //used to hide elts
    let x = 0;
    let opacityArr;
    if(mode==='reveal'){
        opacityArr = increasingOpacity;
    } else {
        opacityArr = decreasingOpacity;
    };
    //functions wrapped with parentheses are called immediatly invoked function expressions, or self executing functions
    (function changeOpacity(elt, opacityArr){
        elt.style.opacity = opacityArr[x];
        if(++x < opacityArr.length) {
            setTimeout(changeOpacity, timer, elt, opacityArr); //time given in milliseconds. Parameter given after milliseconds
        }
    })(elt, opacityArr);
    /* if (mode==='fadeout'){elt.style.display='none';} */
};

const intro = document.getElementById('intro');
const identification = document.getElementById('identification');
function showNext(){
    wrapper(intro);
    setTimeout(() => {
        intro.style.display = 'none';
        identification.style.display = 'block';
        wrapper(identification, 'reveal');
    }, timer*arrLen+500);
}

const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const overlay = document.getElementById('overlay');
const form = document.getElementsByClassName('buttons')[0];
const oui = document.getElementById('oui');
const participants = document.querySelectorAll('.participant');
participants.forEach(item => {
    item.addEventListener('click', function(){
        modalText.textContent = "Êtes-vous bien " + item.textContent + " ?";
        overlay.classList.add('active');
        modal.classList.add('active');
        oui.setAttribute("name", item.textContent);
    });
});
const non = document.getElementById('non');
non.addEventListener('click', function(){
    modal.classList.remove('active');
    overlay.classList.remove('active');
});

const explanation = document.getElementById('explanation');

export {wrapper, timer, arrLen, showNext};