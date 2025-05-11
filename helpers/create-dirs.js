const fs = require('fs');
const path = require('path');

const dir = path.join('build', 'email', 'content');
fs.mkdirSync(dir, { recursive: true });