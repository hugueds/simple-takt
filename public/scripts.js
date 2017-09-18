var socket = io.connect('http://10.8.66.81:8080');
var instance;

$(document).ready(function () {
  	init();
});

function init() {
    //var instance = { id: 0, name: "Quente", initial: "7:30", currentTime: 0 };
    instance = getLocalInstance();
    if (!instance && window.location.pathname != "/config/") {
        window.location = '/config';
        localStorage.clear('currentStation');
        return;
    }
    socket.on('connect', function () {
        setInterval(function () {
            if (!instance) return;
            socket.emit('get timer', instance);
        }, 1000);

    });

    socket.on('timer', function (data) {
        updateTimer(data.currentTime);
    });

    window.addEventListener('keydown', function (key) {
        if (key.keyCode == 34) {
            // if (instance.currentTime <= 0){
            reinitialize(instance);
            // }            
        }
    });

}

function reinitialize(inst) {
    socket.emit('reinitialize', inst);
    return true;
}

function updateTimer(ms) {
    var timer = convertMsToTime(ms);
    if (ms >= 0) {
        $('body').removeClass('negative-timer');
    } else {
        $('body').addClass('negative-timer');
    }
    $('#timer').text(timer);
    return true;
}

function setLocalInstance(inst) {
    localStorage.setItem('currentInstance', JSON.stringify(inst));
    return true;
}

function getLocalInstance() {
    return JSON.parse(localStorage.getItem('currentInstance'));
}

function convertMsToTime(ms) {
    var negative = false;
    var takt;
    if (ms < 0) {
        negative = true;
        ms = ms * -1;
    }
    var hr = 0;
    var min = (ms / 1000 / 60) << 0;
    var sec = (ms / 1000) % 60;

    if (sec < 10)
        takt = min + ":0" + sec;
    else
        takt = min + ":" + sec;

    if (negative)
        takt = "-" + takt;

    return takt;
}


/*
CONFIG PAGE
*/

$('.save-button').on('click', function () {
    saveChanges(function(){
        window.location = '/';    
    });    
})

function saveChanges(callback) {
    var inst = {};
    inst.id = $('select[name=instance]').val();
    var valueSeconds = parseInt($('input[name=seconds]').val());
    var valueMinutes = parseInt($('input[name=minutes]').val());
    if (valueMinutes == 0 && valueSeconds == 0){
        return alert('O valor deve ser maior do que 0');
    }
    if (valueMinutes > 59 || valueSeconds > 59 || (typeof valueSeconds != 'number') || (typeof valueMinutes != 'number') ){
        return alert('Favor preencher com horário válido');
    }
    inst.initial = $('input[name=minutes]').val() + ':' + $('input[name=seconds]').val();
    setLocalInstance(inst);
    socket.emit('reinitialize', inst);   
    callback();
}

$('input[name=minutes]').keydown(function (e) {
    var value1 = parseInt($('input[name=minutes]').val());
    if (value1 >59){
        $('input[name=minutes]').val(59);
    } else if (value1 < 0 ){
        $('input[name=minutes]').val(0);
    }
})

$('input[name=seconds]').keydown(function (e) {   
    var value2 = parseInt($('input[name=seconds]').val());    
    if (value2 >59){
        $('input[name=seconds]').val(59);
    } else if (value2 < 0 ){
        $('input[name=seconds]').val(0);
    }    
})

