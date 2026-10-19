/*
 * OrphionMC - Real-time Server Status Checker
 * Uses public mcsrvstat.us API
 */

document.addEventListener('DOMContentLoaded', function () {
    const serverIp = 'play.orphionmc.net';
    const apiUrl = `https://api.mcsrvstat.us/2/${serverIp}`;

    const statusDot = document.getElementById('status-dot');
    const playerCount = document.getElementById('player-count');

    if (!statusDot || !playerCount) return;

    function checkServerStatus() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response error');
                return response.json();
            })
            .then(data => {
                if (data && data.online) {
                    // Servidor Online
                    statusDot.style.backgroundColor = '#4CAF50';
                    statusDot.style.boxShadow = '0 0 10px #4CAF50';
                    const onlineCount = (data.players && typeof data.players.online === 'number') ? data.players.online : 0;
                    const maxCount = (data.players && typeof data.players.max === 'number') ? data.players.max : 100;
                    playerCount.textContent = `${onlineCount} / ${maxCount} Online`;
                    playerCount.style.color = '#4CAF50';
                } else {
                    // Servidor Offline
                    statusDot.style.backgroundColor = '#F44336';
                    statusDot.style.boxShadow = '0 0 10px #F44336';
                    playerCount.textContent = 'Offline';
                    playerCount.style.color = '#F44336';
                }
            })
            .catch(error => {
                console.warn('No se pudo consultar el estado del servidor:', error);
                statusDot.style.backgroundColor = '#888888';
                statusDot.style.boxShadow = 'none';
                playerCount.textContent = 'play.orphionmc.net';
                playerCount.style.color = 'var(--gold)';
            });
    }

    // Consulta inicial inmediata
    checkServerStatus();

    // Actualizar periódicamente cada 30 segundos
    setInterval(checkServerStatus, 30000);
});
