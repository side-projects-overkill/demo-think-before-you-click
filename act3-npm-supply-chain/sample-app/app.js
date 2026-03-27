const dt = require("cool-datetime-helper");

console.log("=== My Awesome App ===");
console.log("Today:", dt.formatDate());
console.log("Time:", dt.formatTime());
console.log("Full:", dt.formatDateTime());
console.log("In 7 days:", dt.daysFromNow(7));
console.log("1 hour ago:", dt.timeAgo(new Date(Date.now() - 3600000)));
console.log("");
console.log("Everything looks normal... but check http://10.215.116.159:4000 ;)");
