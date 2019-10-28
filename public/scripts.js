var instance = {
    id: -1,
    name: '',
    initial: '00:00',
    objective: 0,
    produced: 0,
    currentTime: 0,
    andon: false
};

var ip = '';

var socket = io('/', {path: '/takt/socket.io' });

socket.on('connect', function () {
    console.log('Socket Connected');
    setInterval(function () {
        if (!instance) return;
        socket.emit('get timer', instance);
    }, 1000);
});

socket.on('timer', function (data) {
    updateTimer(data.currentTime);
    updateAndon(data.currentTime, data.andon)
    $('#objective').text(data.objective);
    $('#produced').text(data.produced);
});

socket.on('new connection', function (ip) {
    console.log('Novo dispositivo conectado: ', ip);
});

socket.emit('get ip');

socket.on('ip', function (data) {
    console.log('Meu endereço: ', data);
});

socket.on('andon', function (andon) {
    instance.andon = andon;
});

socket.on('reload', function () {
    location.reload();
});

socket.on('reinitialize', function (data) {
    if (data.id == instance.id) {
        location.reload();
    }
});

$(document).ready(function () {
    init(function () {
        socketHandler();
    });
});

function init(callback) {
    instance.id = getLocalInstance();
    console.log(instance)
    if ((!instance.id || instance.id == -1) && window.location.pathname == "/") {
        window.location = '/home';
        localStorage.clear('currentInstance');
        return;
    }
    window.addEventListener('keydown', function (key) {
        if (key.keyCode == 34) { // Page Down
            // if (instance.currentTime <= 0){
            reinitialize(instance);
            // }            
        }
        if (key.keyCode == 33) { // Page Up
            console.log('Chamando andon');
            socket.emit('andon', instance);
        }
    });

    callback();

}



function reinitialize(inst) {
    socket.emit('reinitialize', inst);
    return true;
}

function updateAndon(ms, andon) {
    if (andon && ms >= 0) {
        $('body').addClass('andon-timer');
    } else if (andon && ms <= 0) {
        $('body').removeClass('andon-timer');
    }
    if (!andon) {
        $('body').removeClass('andon-timer');
    }
}

function updateTimer(ms) {
    var timer = convertMsToTime(ms);
    if (ms >= 0) {
        $('body').removeClass('negative-timer');
        $('.timer-value').removeClass('negative-timer-value');
    } else {
        $('body').addClass('negative-timer');
        $('.timer-value').addClass('negative-timer-value');
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

// CONFIG PAGE

$('.save-button').on('click', function ($event) {
    saveChanges();
});

$('#reload-button').on('click', function ($event) {
    socket.emit('reload-command', 'all');
})

function saveChanges(callback) {
    var inst = {};
    inst.id = parseInt($('select[name=instance]').val());
    var valueSeconds = parseInt($('input[name=seconds]').val());
    var valueMinutes = parseInt($('input[name=minutes]').val());
    if (valueMinutes == 0 && valueSeconds == 0) {
        return alert('O valor deve ser maior do que 0');
    }
    if ( /* valueMinutes > 59  || */ valueSeconds > 59 || (typeof valueSeconds != 'number') || (typeof valueMinutes != 'number')) {
        return alert('Favor preencher com horário válido');
    }
    inst.initial = $('input[name=minutes]').val() + ':' + $('input[name=seconds]').val();
    console.log('Enviando dados para o servidor', inst);
    socket.emit('save changes', inst);
}

$('input[name=minutes]').keydown(function (e) {
    var value1 = parseInt($('input[name=minutes]').val());
    if (value1 > 999) {
        $('input[name=minutes]').val(59);
    } else if (value1 < 0) {
        $('input[name=minutes]').val(0);
    }
})

$('input[name=seconds]').keydown(function (e) {
    var value2 = parseInt($('input[name=seconds]').val());
    if (value2 > 59) {
        $('input[name=seconds]').val(59);
    } else if (value2 < 0) {
        $('input[name=seconds]').val(0);
    }
})


function socketHandler() {



}
