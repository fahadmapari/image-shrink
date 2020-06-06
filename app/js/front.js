const path = require('path');
const os = require('os');
const {ipcRenderer} = require('electron');

const form = document.getElementById('image-form');
const img = document.getElementById('img');
const slider = document.getElementById('slider');
const btnSubmit = document.getElementById('btn-submit');
const output = document.querySelector('.card-content');

document.getElementById("output-path").innerText = path.join(os.homedir(), "imageshrink");


//events
form.addEventListener('submit', e =>{
    e.preventDefault();
    const imgPath = img.files[0].path;
    const quality = Number(slider.value);

    ipcRenderer.send('image:minimize', { 
        imgPath, 
        quality
    });

    btnSubmit.disabled = true;
});


output.onclick = (e)=>{
    ipcRenderer.send("output:open");
}

ipcRenderer.on("image:done", (e)=>{
    btnSubmit.disabled = false;

    M.toast({
        html: `Image resized to ${slider.value}%`
    });
});

