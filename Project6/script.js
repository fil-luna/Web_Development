let time = document.getElementById('time');

let colorsArray = ["#4fc3f7", "#29b6f6", "#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b", "#9575cd", "#7e57c2", "#673AB7", "#5E35B1", "#512DA8", "#4527A0", "#311B92", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1"];

let index = 0;

function rotateColor(){
    let color = colorsArray[index];
    document.body.style.backgroundColor = color;
    index++;
    if (index >= colorsArray.length){
        index = 0;
    }
}

function getTime() {
    let currentTime = new Date();
    let hours = (currentTime.getHours() % 12).toString();
    let minutes = currentTime.getMinutes().toString();
    let seconds = currentTime.getSeconds().toString();

    if (hours.length < 2) {
        hours = '0' + hours;
    }

    if (hours === '00') {
        hours = '12';
    }

    if (minutes.length < 2) { 
        minutes = '0' + minutes;
    }

    if (seconds.length < 2) {
        seconds = '0' + seconds;
    }

    let theTime = `${hours} : ${minutes} : ${seconds}`;
    time.textContent = theTime;
    rotateColor()
}

getTime();
setInterval(getTime, 1000);

