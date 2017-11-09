module.exports = function (server) {

    const io = require('socket.io')(server);

    io.on('connection', (socket) => {

        clients.push(socket);

        console.log(clients);

        let client = socket.request.connection.remoteAddress.slice(7);

        io.emit('new connection', client);

        console.log('New connection =>', client);

        socket.on('get ip', function () {
            socket.emit('ip', clients.indexOf(socket));
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
            console.log('Andon Call for station ID:', data.id, 'is', andon);
            socket.emit('andon', andon);
        });

        socket.on('update timer', (data) => {
            updateTimer(instances[data.instance], data.timer);
            socket.emit('updated', `Instance ${instances[data.instance]} updated`);
        });

        socket.on('save changes', (data) => {
            instances[data.id] = data;
            io.emit('reinitialize', data.id)
            console.log(`Changes has been done at Instance ${data.id}`);
        });

        socket.on('disconnect', (socket) => {
            let idx = clients.indexOf(socket);
            if (idx > -1) {
                clients.splice(idx, 1);
                console.log('Client disconnected', idx);
            }
        });

    });
}