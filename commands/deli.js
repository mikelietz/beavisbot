exports.names = ['deli'];
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.cdAll = 10;
exports.cdUser = 30;
exports.cdStaff = 30;
exports.minRole = PERMISSIONS.NONE;
exports.handler = function (data) {
    users = bot.getUsers();
    var randomNumber = _.random(1, users.length);
    bot.sendChat("/me :bell: Now serving customer #" + randomNumber + " - hey there, " + users[(randomNumber - 1)].username + "!");
};