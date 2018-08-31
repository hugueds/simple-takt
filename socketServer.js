module.exports = function (server) {

    // criar comando para mostrar valores das instancias atuais

    const io = require('socket.io')(server);
    const cron = require('node-cron');
    const config = require('./config');

    const instances = config.instances;
    const MAX_INSTANCES = instances.length;

    instances.map(i => i.currentTime = convertToMs(i.initial));

    cron.schedule('0 10 7 * * *', function () {
        for (let i = 0; i < MAX_INSTANCES; i++) {
            instances[i].produced = 0;
        }
        console.log(`${new Date().toTimeString().slice(0,8)} => Reinitiating production...`);
    });

    let clients = [];

    io.on('connection', (socket) => {

        let client = socket.request.connection.remoteAddress.slice(7);       

        clients.push(client);

        console.log(clients);

        io.emit('new connection', client);

        console.log(`${new Date().toTimeString().slice(0,8)} => New connection ${client} `);

        socket.on('get ip', function () {
            io.emit('ip', clients.indexOf(socket));
        });

        socket.on('get timer', (data) => {
            let instance = instances[data.id];
            socket.emit('timer', instance);
        });

        socket.on('reinitialize', (data) => {
            let instance = instances[data.id];
            let initialMs = convertToMs(instance.initial);
            instances[data.id].currentTime = initialMs;
            instances[data.id].produced++;
        });

        socket.on('andon', (data) => {
            let andon = !instances[data.id].andon
            instances[data.id].andon = andon
            console.log(`${new Date().toTimeString().slice(0,8)} => Andon Call for station ID: ${data.id} is ${data.andon}`);            
            socket.emit('andon', andon);
        });

        socket.on('update timer', (data) => {
            updateTimer(instances[data.instance], data.timer);
            socket.emit('updated', `Instance ${instances[data.instance]} updated`);
        });

        socket.on('save changes', (data) => {            
            instances[data.id].initial = data.initial;
            instances[data.id].currentTime = 0;
            io.emit('reinitialize', data);
            console.dir(instances[data.id]);
            console.log(`${new Date().toTimeString().slice(0,8)} => Changes has been done at Instance ${data.id}`);
        });

        socket.on('reload page', (ip) => {

        });

        socket.on('reload-command', (data) => {
            io.emit('reload', 'all');
            console.log('Reiniciando telas');
        });

        socket.on('disconnect', (socket) => {            
            let idx = clients.indexOf(client);            
            if (idx > -1) {
                clients.splice(idx, 1);
                console.log(`${new Date().toTimeString().slice(0,8)} => Client disconnected ${idx}`);
            }
        });

    });

    init();

    function init() {
        const routineInterval = setInterval(pool, 1000);
        io.emit('reload', 'all');
    }

    function pool() {
        for (let i = 0; i < MAX_INSTANCES; i++) {
            let instance = instances[i];
            countDown(instance);
            increaseProduction(instance);
        }
    }

    function countDown(instance) {
        let currentTime = instance.currentTime - 1000;
        instance.currentTime = currentTime;
    }

    function updateTimer(instance, time) {
        instances[instance].currentTime = time;
    }

    function increaseProduction(instance) {        
        if (!instance.andon && instance.currentTime < 0) {
            instance.currentTime = convertToMs(config.instances[instance.id].initial);
            instances[instance.id].produced += 1;
        }
    }

    function convertToMs(timeString) {
        if (!timeString) {
            return;
        }
        let tms = ((Number(timeString.split(':')[0]) * 60) + (Number(timeString.split(':')[1])))
        tms = tms * 1000;
        return tms;
    }



}