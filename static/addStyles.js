let styleText = document.getElementById('sectorStyles').sheet;

for(i=1; i<9; i++){
    const rule = `.sector:nth-child(${i}){
        transform: translate(-50%, -50%) rotate(${(i-1)*45}deg) translateY(-100px);
    }`;
    styleText.insertRule(rule);
};

for(i=9; i<17; i++){
    const rule = `.sector:nth-child(${i}){
        transform: translate(-50%, -50%) rotate(${22.5 + (i-9)*45}deg) translateY(-100px);
        background-color: black;
    }`;
    styleText.insertRule(rule);
};