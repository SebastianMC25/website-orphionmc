const express = require('express');
const path = require('path');

const forum = express.Router();
const webRoot = path.resolve(__dirname, '../../');

const staticOptions = {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : '1h',
    etag: true
};

// Static files for forum (css, js, assets)
// We need to serve the root assets because index.css/js are shared
forum.use('/css', express.static(path.join(webRoot, 'css'), staticOptions));
forum.use('/js', express.static(path.join(webRoot, 'js'), staticOptions));
forum.use('/assets', express.static(path.join(webRoot, 'assets'), staticOptions));
// Serve other root assets (videos, manifest, etc.)
forum.use('/', express.static(webRoot, { index: false, maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 }));

// Forum routes
forum.get('/', (req, res) => res.sendFile(path.join(webRoot, 'forum.html')));
forum.get('/categoria', (req, res) => res.sendFile(path.join(webRoot, 'view_category.html')));
forum.get('/tema', (req, res) => res.sendFile(path.join(webRoot, 'view_thread.html')));
forum.get('/nuevo-tema', (req, res) => res.sendFile(path.join(webRoot, 'create_thread.html')));
forum.get('/login', (req, res) => res.sendFile(path.join(webRoot, 'login.html')));
forum.get('/registro', (req, res) => res.sendFile(path.join(webRoot, 'register.html')));

// Professional SEO & OpenGraph Bridge
// In a premium setup, we'd use a templating engine (EJS/Pug) or a middleware
// to inject meta tags before sending the file.
forum.get('/tema/:id', (req, res) => {
    // This is where we'd serve view_thread.html but with pre-rendered meta tags
    res.sendFile(path.join(webRoot, 'view_thread.html'));
});

module.exports = forum;
