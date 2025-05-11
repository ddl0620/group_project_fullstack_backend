import fs from 'fs';
import path from 'path';

const dir = path.join('build', 'email', 'content');
fs.mkdirSync(dir, { recursive: true });
console.log(`Created directory: ${dir}`);
