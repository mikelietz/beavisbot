var DubAPI = require('dubapi');
var fs = require('fs');
path = require('path')
var config = require(path.resolve(__dirname, 'config.json'));

var roomHasActiveMods = false;
var skipTimer;
var botUser = {};

initializeModules(config.auth);

new DubAPI(config.auth, function (err, bot) {
    bot.connect(config.roomName);

    bot.on('connected', function (data) {
        console.log('Connected: ', data);
    });

    bot.on('ready', function (data) {

        console.log('[EVENT] Ready - joined room: ' + config.roomName);
        if (config.verboseLogging) {
            console.log('[INIT] Room data: ' + JSON.stringify(data, null, 2));
        }

        bot.getUser(null, function (user) {
            botUser = user;
            console.log('[INIT] Data loaded for ' + botUser.username);
            // data contains the currentDJ (by name) and currentTrack (artist and track), and the list of users in the room (does not update on join/depart)
        });

        if (config.responses.botConnect !== "") {
            bot.chat(config.responses.botConnect);
        }

        if (config.verboseLogging) {
            bot.getEvents(function (events) {
                console.log("These are the Dubtrack events I respond to: ", events);

            });
        }

        //    bot.getUsers().forEach(function (user) {
        //        updateDbUser(user);
        //    });

        if (config.wootSongs == 'ALL') {
            bot.updub();
        }

    });

    bot.on('chat-message', function (data) {

        if (config.verboseLogging) {
            console.log('[CHAT]', JSON.stringify(data, null, 2));
        }
        else if (data.user.username !== undefined && data.user.username !== null) {
            console.log('[CHAT]', data.user.username + ': ' + data.message);
        }

        if (data.user.username !== undefined && data.user.username !== null) {
            data.message = data.message.trim();
            //if (data.msg == '.') {
            //    bot.moderateDeleteChat(data.id);
            //}
            //else {
            //    handleCommand(data);
            //}
            handleCommand(data);
            //User.update({last_active: new Date(), last_seen: new Date()}, {where: {id: data.from.id}});
        }
    });

    bot.on('room_playlist-update', function (data) {

        if (config.verboseLogging) {
            console.log('[EVENT] room_playlist-update ', JSON.stringify(data, null, 2));
        } else {
            console.log('[EVENT] room_playlist-update');
        }

        //saveWaitList(true);

        // Writes current room state to outfile so it can be used for the web
        if (config.roomStateFile) {

            var JSONstats = {}

            //JSONstats.media = bot.getMedia();
            //JSONstats.dj = bot.getDJ();
            //JSONstats.waitlist = bot.getWaitList();
            JSONstats.users = bot.getUsers();
            //JSONstats.staff = bot.getStaff();

            fs.writeFile(
                config.roomStateFile,
                JSON.stringify(JSONstats, null, 2),
                function (err) {
                    if (err) {
                        console.log(err);
                        return console.log(err);
                    }
                }
            );

        }

        //// Write previous play data to DB
        //if (data.lastPlay.media !== null && data.lastPlay.dj !== null) {
        //    Song.find({
        //        where: {
        //            format: data.lastPlay.media.format,
        //            cid: data.lastPlay.media.cid
        //        }
        //    }).then(function (song) {
        //        if (song !== null) {
        //            Play.create({
        //                user_id: data.lastPlay.dj.id,
        //                song_id: song.id,
        //                positive: data.lastPlay.score.positive,
        //                negative: data.lastPlay.score.negative,
        //                grabs: data.lastPlay.score.grabs,
        //                listeners: data.lastPlay.score.listeners,
        //                skipped: data.lastPlay.score.skipped
        //            });
        //        }
        //    });
        //}
        //
        //if (data.media != null) {
        //
        //    if (data.currentDJ != null) {
        //        logger.success('********************************************************************');
        //        logger.success('[UPTIME]', 'Bot online ' + timeSince(startupTimestamp, true));
        //        logger.success('[SONG]', data.currentDJ.username + ' played: ' + data.media.author + ' - ' + data.media.title);
        //    }
        //
        //    // Perform automatic song metadata correction
        //    if (config.autoSuggestCorrections) {
        //        correctMetadata();
        //    }
        //
        //    // Auto skip for "stuck" songs
        //    clearTimeout(skipTimer);
        //    skipTimer = setTimeout(function () {
        //        if (bot.getMedia() && bot.getMedia().cid == data.media.cid) {
        //            bot.moderateForceSkip();
        //        }
        //    }, (data.media.duration + 5) * 1000);
        //
        //    // Write current song data to DB
        //    var songData = {
        //        plug_id: data.media.id,
        //        author: data.media.author,
        //        title: data.media.title,
        //        format: data.media.format,
        //        cid: data.media.cid,
        //        duration: data.media.duration,
        //        image: data.media.image
        //    };
        //    Song.findOrCreate({
        //        where: {format: data.media.format, cid: data.media.cid},
        //        defaults: songData
        //    }).spread(function (song) {
        //        song.updateAttributes(songData);
        //    });
        //
        if (config.wootSongs == 'ALL') {
            bot.updub();
        }

        //SongResponse.find({
        //    where: Sequelize.or(
        //        Sequelize.and({media_type: 'author', trigger: {like: data.media.author}, is_active: true}),
        //        Sequelize.and({media_type: 'title', trigger: {like: data.media.title}, is_active: true})
        //    )
        //}).then(function (row) {
        //    if (row !== null) {
        //        if (row.response != '') {
        //            bot.chat(row.response);
        //        }
        //        if (row.rate === 1) {
        //            bot.woot();
        //        }
        //        else if (row.rate === -1) {
        //            bot.meh();
        //        }
        //    }
        //});
        //
        //    var maxIdleTime = config.activeDJTimeoutMins * 60;
        //    var idleDJs = [];
        //    roomHasActiveMods = false;
        //
        //    Promise.map(bot.getWaitList(), function (dj) {
        //        return User.find({
        //            where: {id: dj.id},
        //            include: {
        //                model: Karma,
        //                required: false,
        //                where: {
        //                    type: 'warn',
        //                    created_at: {gte: moment.utc().subtract(config.activeDJTimeoutMins, 'minutes').toDate()}
        //                },
        //                limit: 1,
        //                order: [['created_at', 'DESC']]
        //            }
        //        }).then(function (dbUser) {
        //            var position = bot.getWaitListPosition(dj.id);
        //            if (dbUser !== null) {
        //                if (secondsSince(dbUser.last_active) >= maxIdleTime && moment.utc().isAfter(moment.utc(startupTimestamp).add(config.activeDJTimeoutMins, 'minutes'))) {
        //                    logger.warning('[WL-IDLE]', position + '. ' + dbUser.username + ' last active ' + timeSince(dbUser.last_active));
        //                    if (dbUser.Karmas.length > 0) {
        //                        logger.warning('[WL-IDLE]', dbUser.username + ' was last warned ' + timeSince(dbUser.Karmas[0].created_at));
        //                        bot.moderateRemoveDJ(dj.id);
        //                        bot.chat('@' + dbUser.username + ' ' + config.responses.activeDJRemoveMessage);
        //                        var userData = {
        //                            type: 'remove',
        //                            details: 'Removed from position ' + position + ': AFK for ' + timeSince(dbUser.last_active, true),
        //                            user_id: dj.id,
        //                            mod_user_id: bot.getUser().id
        //                        };
        //                        Karma.create(userData);
        //                        User.update({waitlist_position: -1}, {where: {id: dj.id}});
        //                    }
        //                    else if (position > 1) {
        //                        var userData = {
        //                            type: 'warn',
        //                            details: 'Warned in position ' + position + ': AFK for ' + timeSince(dbUser.last_active, true),
        //                            user_id: dj.id,
        //                            mod_user_id: bot.getUser().id
        //                        };
        //                        Karma.create(userData);
        //                        idleDJs.push(dbUser.username);
        //                    }
        //                }
        //                else {
        //                    if (dj.role > 1) {
        //                        roomHasActiveMods = true;
        //                    }
        //                    logger.info('[WL-ACTIVE]', position + '. ' + dbUser.username + ' last active ' + timeSince(dbUser.last_active));
        //                }
        //            }
        //        });
        //    }).then(function () {
        //        if (idleDJs.length > 0) {
        //            var idleDJsList = idleDJs.join(' @');
        //            bot.chat('@' + idleDJsList + ' ' + config.responses.activeDJReminder);
        //        }
        //
        //        Song.find({
        //            where: {
        //                format: data.media.format,
        //                cid: data.media.cid,
        //                is_banned: true
        //            }
        //        }).then(function (row) {
        //            if (row !== null) {
        //                logger.warning('[SKIP] Skipped ' + data.currentDJ.username + ' spinning a blacklisted song: ' + data.media.author + ' - ' + data.media.title + ' (cid: ' + data.media.cid + ')');
        //                bot.chat('Sorry @' + data.currentDJ.username + ', this video has been blacklisted in our song database.');
        //                bot.moderateForceSkip();
        //                var userData = {
        //                    type: 'skip',
        //                    details: 'Skipped for playing a blacklisted song: ' + data.media.author + ' - ' + data.media.title + ' (cid: ' + data.media.cid + ')',
        //                    user_id: data.currentDJ.id,
        //                    mod_user_id: bot.getUser().id
        //                };
        //                Karma.create(userData);
        //            }
        //        });
        //
        //        if (config.maxSongLengthSecs > 0 && data.media.duration > config.maxSongLengthSecs) {
        //            logger.warning('[SKIP] Skipped ' + data.currentDJ.username + ' spinning a song of ' + data.media.duration + ' seconds');
        //            var maxLengthMins = Math.floor(config.maxSongLengthSecs / 60);
        //            var maxLengthSecs = config.maxSongLengthSecs % 60;
        //            if (maxLengthSecs < 10) {
        //                maxLengthSecs = "0" + maxLengthSecs;
        //            }
        //            bot.chat('Sorry @' + data.currentDJ.username + ', this song is over our maximum room length of ' + maxLengthMins + ':' + maxLengthSecs + '.');
        //            bot.moderateForceSkip();
        //            var userData = {
        //                type: 'skip',
        //                details: 'Skipped for playing a song of ' + data.media.duration + ' (room configured for max of ' + config.maxSongLengthSecs + 's)',
        //                user_id: data.currentDJ.id,
        //                mod_user_id: bot.getUser().id
        //            };
        //            Karma.create(userData);
        //
        //        }
        //    });
        //
        //}

    });

    bot.on('error', function (msg, trace) {
        console.log("Got an error from the virtual browser: ", msg, trace);
    });
    bot.on('room_playlist-queue-remove-user', function (data) {
        console.log('[EVENT] room_playlist-queue-remove-user' + JSON.stringify(data, null, 2));
    });
    bot.on('room_playlist-queue-reorder', function (data) {
        console.log('[EVENT] room_playlist-queue-reorder' + JSON.stringify(data, null, 2));
    });

    bot.on('user-join', function (data) {

        if (config.verboseLogging) {
            console.log('[JOIN]', JSON.stringify(data, null, 2));
        }
        else {
            console.log('[JOIN] ' + data.user.username + ' joined');
        }

        var newUser = false;
        var message = "";

        if (data.username !== botUser.username) {
//            User.findById(data.id).then(function (dbUser) {
//
//                if (data.username == config.superAdmin && config.responses.welcome.superAdmin != null) {
//                    message = config.responses.welcome.superAdmin.replace('{username}', data.username);
//                    logger.info('[JOIN]', data.username + ' last seen ' + timeSince(dbUser.last_seen));
//                }
//                else if (dbUser == null) {
//                    message = config.responses.welcome.newUser.replace('{username}', data.username);
//                    newUser = true;
//                    logger.info('[JOIN]', data.username + ' is a first-time visitor to the room!');
//                }
//                else {
//                    message = config.responses.welcome.oldUser.replace('{username}', data.username);
//                    logger.info('[JOIN]', data.username + ' last seen ' + timeSince(dbUser.last_seen));
//                }
//
//                // Greet with the theme if it's not the default
//                RoomEvent.find({
//                    where: {
//                        starts_at: {lte: new Date()},
//                        ends_at: {gte: new Date()}
//                    }
//                }).then(function (row) {
//                    if (row !== null) {
//                        if (row.type == 'event') {
//                            message += ' :star: SPECIAL EVENT :star: ' + row.title + ' (.event for details)';
//                        }
//                        else if (row.type == 'theme') {
//                            message += ' Theme: ' + row.title + ' (.theme for details)';
//                        }
//                    }
//                });
//
//                if (!roomHasActiveMods) {
//                    message += ' Type .help if you need it!';
//                }

            if (message && (config.welcomeUsers == "NEW" || config.welcomeUsers == "ALL")) {
                if (newUser) {
                    setTimeout(function () {
                        bot.chat(message)
                    }, 5000);
                }
                else if (config.welcomeUsers == "ALL" && secondsSince(dbUser.last_active) >= 900 && secondsSince(dbUser.last_seen) >= 900) {
                    setTimeout(function () {
                        bot.chat(message)
                    }, 5000);
                }
            }

//                // Restore spot in line if user has been gone < 15 mins
//                var position = bot.getWaitListPosition(data.id);
//                if (!newUser && dbUser.waitlist_position > -1 && secondsSince(dbUser.last_seen) <= 900 && (position === -1 || (position > -1 && position > dbUser.waitlist_position))) {
//                    bot.moderateAddDJ(data.id, function () {
//                        if (dbUser.waitlist_position < bot.getWaitList().length && position !== dbUser.waitlist_position) {
//                            bot.moderateMoveDJ(data.id, dbUser.waitlist_position);
//                            var userData = {
//                                type: 'restored',
//                                details: 'Restored to position ' + dbUser.waitlist_position + ' (disconnected for ' + timeSince(dbUser.last_seen, true) + ')',
//                                user_id: data.id,
//                                mod_user_id: bot.getUser().id
//                            };
//                            Karma.create(userData);
//
//                            setTimeout(function () {
//                                bot.chat('/me put @' + data.username + ' back in line :thumbsup:')
//                            }, 5000);
//                        }
//
//                    });
//                }
//
//            });
//            updateDbUser(bot.getUser(data.id));
//        }
        }
    });

    bot.on('user-leave', function (data) {
        console.log('[LEAVE]', 'User left: ' + data.username);
        // User.update({last_seen: new Date()}, {where: {id: data.id}});
    });

//bot.on('userUpdate', function (data) {
//    if (config.verboseLogging) {
//        logger.info('[EVENT] USER_UPDATE', data);
//    }
//});

//bot.on('grab', function (data) {
//    var user = _.findWhere(bot.getUsers(), {id: data});
//    if (user) {
//        logger.info('[GRAB]', user.username + ' grabbed this song');
//    }
//});
//
    bot.on('room_playlist-dub', function (data) {

        if (config.verboseLogging) {
            console.log('[VOTE] ' + JSON.stringify(data, null, 2));
        }
        else {
            console.log('[VOTE] ' + data.user.username + ' voted ' + data.dubtype);
        }
        //var user = _.findWhere(bot.getUsers(), {id: data.i});
        //
        //if (config.prohibitMehInLine && data.v === -1 && bot.getWaitListPosition(data.i) > 0) {
        //    bot.chat('@' + user.username + ', voting MEH while in line is prohibited. Please woot or leave the wait list.');
        //    setTimeout(function () {
        //        removeIfMehing(user.username);
        //    }, 10 * 1000);
        //}
    });


//bot.on('djListUpdate', function (data) {
//    if (config.verboseLogging) {
//        logger.success('[EVENT] DJ_LIST_UPDATE', JSON.stringify(data, null, 2));
//    }
//    saveWaitList(false);
//});
//
//if (config.requireWootInLine || config.activeDJTimeoutMins > 0) {
//    setInterval(monitorDJList, 5000);
//}

});

function saveWaitList(wholeRoom) {

    if (wholeRoom) {
        var userList = bot.getUsers();
    }
    else {
        var userList = bot.getWaitList();
    }
    userList.forEach(function (user) {
        var position = bot.getWaitListPosition(user.id);
        // user last seen in 900 seconds
        if (position > 0) {
            User.update({waitlist_position: position, last_seen: moment.utc().toDate()}, {where: {id: user.id}});
        }
        else {
            User.update({waitlist_position: -1}, {where: {id: user.id}});
        }
        if (config.verboseLogging) {
            console.log('Wait List Update', user.username + ' => ' + position);
        }

    });
    User.update({waitlist_position: -1}, {
        where: {
            last_seen: {lte: moment.utc().subtract(15, 'minutes').toDate()},
            last_active: {lte: moment.utc().subtract(15, 'minutes').toDate()}
        }
    });

}

function updateDbUser(user) {

    var userData = {
        id: user.id,
        username: user.username,
        language: user.language,
        avatar_id: user.avatarID,
        badge: user.badge,
        blurb: user.blurb,
        global_role: user.gRole,
        role: user.role,
        level: user.level,
        joined: user.joined,
        last_seen: new Date(),
    };

    // This only gets passed some of the time
    if (user.slug !== undefined) {
        userData.slug = user.slug;
    }

    User.findOrCreate({where: {id: user.id}, defaults: userData}).spread(function (dbUser) {

        // Reset the user's AFK timer if they've been gone for long enough (so we don't reset on disconnects)
        if (secondsSince(dbUser.last_seen) >= 900) {
            userData.last_active = new Date();
            userData.waitlist_position = bot.getWaitListPosition(user.id)
        }
        dbUser.updateAttributes(userData);
    }).catch(function (err) {
        console.log('Error occurred', err);
    });

}

function monitorDJList() {

}

function removeIfMehing(mehUsername) {
    var mehWaitList = bot.getWaitList();
    var mehUser = _.findWhere(mehWaitList, {username: mehUsername});
    if (mehUser !== undefined && mehUser.vote === -1) {
        console.log('[REMOVE] Removed ' + mehUser.username + ' from wait list for mehing');
        var position = bot.getWaitListPosition(mehUser.id);
        bot.moderateRemoveDJ(mehUser.id);
        bot.chat('@' + mehUser.username + ', voting MEH/Chato/:thumbsdown: while in line is prohibited. Check .rules.');
        var userData = {
            type: 'remove',
            details: 'Removed from position ' + position + ' for mehing',
            user_id: mehUser.id,
            mod_user_id: botUser.id
        };
        Karma.create(userData);
        User.update({waitlist_position: -1}, {where: {id: mehUser.id}});
    }
}

function initializeModules(auth) {
    // load context
    require(path.resolve(__dirname, 'context.js'))({auth: auth, config: config});

    // Load commands
    try {
        fs.readdirSync(path.resolve(__dirname, 'commands')).forEach(function (file) {
            var command = require(path.resolve(__dirname, 'commands/' + file));
            commands.push({
                names: command.names,
                handler: command.handler,
                hidden: command.hidden,
                enabled: command.enabled,
                matchStart: command.matchStart
            })
        });
    }
    catch (e) {
        console.error('Unable to load command: ', e);
    }
}

function handleCommand(data) {

    // unescape message
    data.message = S(data.message).unescapeHTML().s;

    data.message = data.message.replace(/&#39;/g, '\'');
    data.message = data.message.replace(/&#34;/g, '\"');
    data.message = data.message.replace(/&amp;/g, '\&');
    data.message = data.message.replace(/&lt;/gi, '\<');
    data.message = data.message.replace(/&gt;/gi, '\>');

    if (data.message.charAt(0) === config.commandLiteral) {

        // Chop off the command literal
        data.message = data.message.substr(1);

        var command = commands.filter(function (cmd) {
            var found = false;
            for (i = 0; i < cmd.names.length; i++) {
                if (!found) {
                    found = (cmd.names[i] == data.message.toLowerCase() || (cmd.matchStart && data.message.toLowerCase().indexOf(cmd.names[i]) == 0));
                }
            }
            return found;
        })[0];

        if (command && command.enabled) {

            if (config.verboseLogging) {
                console.log('[COMMAND]', JSON.stringify(data, null, 2));
            }

            // Don't allow @mention to the bot - prevent loopback
            data.message = data.message.replace('@' + botUser.username, '');

            command.handler(data);
        }
        else if (!config.quietMode) {
            // @TODO - Build the list of possible commands on init() instead of querying every time
            chatResponse(data);
        }
    }
    else if (!config.quietMode && data.message.indexOf('@' + botUser.username) > -1) {
        mentionResponse(data);
    }
}

function correctMetadata() {
    media = bot.getMedia();

    // first, see if the song exists in the db
    //db.get('SELECT id FROM SONGS WHERE id = ?', [media.id], function (error, row) {
    //    if (row == null) {
    //        // if the song isn't in the db yet, check it for suspicious strings
    //        artistTitlePair = S((media.author + ' ' + media.title).toLowerCase());
    //        if (artistTitlePair.contains('official music video')
    //            || artistTitlePair.contains('lyrics')
    //            || artistTitlePair.contains('|')
    //            || artistTitlePair.contains('official video')
    //            || artistTitlePair.contains('[')
    //            || artistTitlePair.contains('"')
    //            || artistTitlePair.contains('*')
    //            || artistTitlePair.contains('(HD)')
    //            || artistTitlePair.contains('(HQ)')
    //            || artistTitlePair.contains('1080p')
    //            || artistTitlePair.contains('720p')
    //            || artistTitlePair.contains(' - ')
    //            || artistTitlePair.contains('full version')
    //            || artistTitlePair.contains('album version')) {
    //            suggestNewSongMetadata(media.author + ' ' + media.title);
    //        }
    //    }
    //});
}

function suggestNewSongMetadata(valueToCorrect) {
    media = bot.getMedia();
    // @FIXME - don't use the room. construct.
    //request('http://developer.echonest.com/api/v4/song/search?api_key=' + config.apiKeys.echoNest + '&format=json&results=1&combined=' + S(valueToCorrect).escapeHTML().stripPunctuation().s, function (error, response, body) {
    //    logger.info('echonest body', body);
    //    if (error) {
    //        bot.chat('An error occurred while connecting to EchoNest.');
    //        bot.error('EchoNest error', error);
    //    } else {
    //        response = JSON.parse(body).response;
    //
    //        room.media.suggested = {
    //            author: response.songs[0].artist_name,
    //            title: response.songs[0].title
    //        };
    //
    //        // log
    //        logger.info('[EchoNest] Original: "' + media.author + '" - "' + media.title + '". Suggestion: "' + room.media.suggested.author + '" - "' + room.media.suggested.title);
    //
    //        if (media.author != room.media.suggested.author || media.title != room.media.suggested.title) {
    //            bot.chat('Hey, the metadata for this song looks wrong! Suggested Artist: "' + room.media.suggested.author + '". Title: "' + room.media.suggested.title + '". Type ".fixsong yes" to use the suggested tags.');
    //        }
    //    }
    //});
}

function mentionResponse(data) {
    // How much ADHD does the bot have?
    if (!config.chatRandomnessPercentage) {
        chatRandomnessPercentage = 100;
    } else {
        chatRandomnessPercentage = config.chatRandomnessPercentage;
    }

    if (_.random(1, 100) > chatRandomnessPercentage) {
        cleverMessage = data.message.replace('@' + botUser.username, '').trim();
        cleverbot.write(cleverMessage, function (response) {
            if (config.verboseLogging) {
                logger.info('[CLEVERBOT]', JSON.stringify(response, null, 2));
            }
            bot.chat('@' + data.user.username + ': ' + response.message);

        });
    }
    else {
        EventResponse.find({
                where: Sequelize.and({event_type: 'mention', is_active: true}),
                order: 'RAND()'
            })
            .then(function (row) {
                if (row === null) {
                    return;
                }
                else {
                    bot.chat(row.response.replace('{sender}', data.user.username));
                }

            });
    }
}

function chatResponse(data) {
    EventResponse.find({
            where: Sequelize.and({event_type: 'chat', trigger: data.message, is_active: true}),
            order: 'RAND()'
        })
        .then(function (row) {
            if (row === null) {
                return;
            }
            else {
                bot.chat(row.response.replace('{sender}', data.user.username));
            }

        });
}

function addCustomPoint(data) {

}