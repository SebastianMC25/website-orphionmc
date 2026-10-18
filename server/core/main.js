const express = require('express');
const path = require('path');
const { requireStaff } = require('./middleware');

const main = express.Router();
const webRoot = path.resolve(__dirname, '../../');

// Static files for main site
main.use('/css', express.static(path.join(webRoot, 'css')));
main.use('/js', express.static(path.join(webRoot, 'js')));
main.use('/assets', express.static(path.join(webRoot, 'assets')));
// Landing uses the mp4 too
main.use('/', (req, res, next) => {
    console.log(`[MainRouter] Routing request for: ${req.path}`);
    next();
}, express.static(webRoot, { index: false }));

main.get('/', (req, res) => {
    console.log(`  -> Serving index.html for Root /`);
    res.sendFile(path.join(webRoot, 'index.html'));
});

main.get('/index.html', (req, res) => {
    console.log(`  -> Serving index.html for /index.html`);
    res.sendFile(path.join(webRoot, 'index.html'));
});

// Protect the staff dashboard
main.get('/staff_dashboard.html', requireStaff, (req, res) => {
    res.sendFile(path.join(webRoot, 'staff_dashboard.html'));
});

module.exports = main;
