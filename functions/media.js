module.exports = function (bot) {

    saveLastSong = function(data) {
        // Write previous play data to DB
        if (data !== undefined && data !== null && data.media !== undefined && data.media !== null) {
            models.Song.find({
                where: {
                    site: config.site,
                    host: data.media.format,
                    host_id: data.media.cid,
                }
            }).then(function (song) {
                if (song !== null) {
                    getDbUserFromSiteUser(data.dj, function (lastDJ) {
                        models.Play.create({
                            site_id: data.media.id.toString(),
                            user_id: lastDJ.id,
                            song_id: song.id,
                            positive: data.score.positive,
                            negative: data.score.negative,
                            grabs: data.score.grabs,
                            listeners: bot.getUsers().length,
                            skipped: data.score.skipped
                        }).catch(function (err) {
                            console.log('[ERROR]', err);
                        });
                    });

                    if (data.score.grabs > 0) {
                        transferCustomPoints(null, data.dj, data.score.grabs);
                    }
                }
            });
        }
    };
    correctMetadata = function () {
        var media = bot.getMedia();

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
    };

    suggestNewSongMetadata = function (valueToCorrect) {
        var media = bot.getMedia();
        // @FIXME - don't use the room. construct.
        //request('http://developer.echonest.com/api/v4/song/search?api_key=' + config.apiKeys.echoNest + '&format=json&results=1&combined=' + S(valueToCorrect).escapeHTML().stripPunctuation().s, function (error, response, body) {
        //    console.log('echonest body', body);
        //    if (error) {
        //        bot.sendChat('An error occurred while connecting to EchoNest.');
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
        //        console.log('[EchoNest] Original: "' + media.author + '" - "' + media.title + '". Suggestion: "' + room.media.suggested.author + '" - "' + room.media.suggested.title);
        //
        //        if (media.author != room.media.suggested.author || media.title != room.media.suggested.title) {
        //            bot.sendChat('Hey, the metadata for this song looks wrong! Suggested Artist: "' + room.media.suggested.author + '". Title: "' + room.media.suggested.title + '". Type ".fixsong yes" to use the suggested tags.');
        //        }
        //    }
        //});
    };
};