/*
 * Server Status Checker
 * Uses mcsrvstat.us API
 */

document.addEventListener('DOMContentLoaded', function() {
    const serverIp = 'play.orphionmc.net';
    const apiUrl = `https://api.mcsrvstat.us/2/${serverIp}`;
    
    // Elements
    const statusDot = document.getElementById('status-dot');
    const playerCount = document.getElementById('player-count');
    
    if(!statusDot || !playerCount) return;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.online) {
                // Online
                statusDot.style.backgroundColor = '#4CAF50';
                statusDot.style.boxShadow = '0 0 10px #4CAF50';
                const onlineCount = data.players && typeof data.players.online === 'number' ? data.players.online : 0;
                const maxCount = data.players && typeof data.players.max === 'number' ? data.players.max : 100;
                playerCount.innerText = `${onlineCount} / ${maxCount} Online`;
                playerCount.style.color = '#4CAF50';
            } else {
                // Offline
                statusDot.style.backgroundColor = '#F44336';
                statusDot.style.boxShadow = '0 0 10px #F44336';
                playerCount.innerText = 'Offline';
                playerCount.style.color = '#F44336';
            }
        })
        .catch(error => {
            console.error('Error fetching server status:', error);
            playerCount.innerText = 'Status Unknown';
        });
});
