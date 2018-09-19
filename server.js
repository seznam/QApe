const path = require('path');

const express = require('express');
const serveStatic = require('serve-static');

const app = express();

app.use(serveStatic(path.join(__dirname, 'example/public')));
app.listen(4444, () => {
	console.log('Point your browser at http://localhost:4444');
});
