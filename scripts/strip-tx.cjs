const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'controllers', 'bookingController.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove session creation
content = content.replace(/const session = await mongoose\.startSession\(\);\s*session\.startTransaction\(\);/g, '');

// Remove abort & end
content = content.replace(/await session\.abortTransaction\(\);\s*session\.endSession\(\);/g, '');

// Remove commit & end
content = content.replace(/await session\.commitTransaction\(\);\s*session\.endSession\(\);/g, '');

// Remove .session(session)
content = content.replace(/\.session\(session\)/g, '');

// Remove { session } object
content = content.replace(/,\s*\{\s*session\s*\}/g, '');

// Remove session from objects
content = content.replace(/session,\s*/g, '');

fs.writeFileSync(filePath, content);
console.log('Transactions stripped successfully!');
