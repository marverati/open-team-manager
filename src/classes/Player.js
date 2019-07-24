


function Player(name, picUrl, playerData) {
    this.name = name;
    this.pictureUrl = picUrl;
    this.playerData = playerData;
    // All matches from the current year the player has participated in
    this.matches = [];
    // For each match, contains the player's data for that specific match
    this.matchDatas = [];
    // Total goals scored by player that year
    this.goalCount = 0;
    // Matches the player has participated in
    this.matchCount = 0;
    // Points accumulated by the player
    this.points = 0;
    // Total own goals scored
    this.ownGoalCount = 0;
    // How often the player changed teams
    this.switchCount = 0;
    // Number of wins
    this.winCount = 0;
    // Number of draws
    this.drawCount = 0;
    // Number of defeates
    this.defeatCount = 0;
    // List of rankings for this player
    this.statistics = [];
    // Temporary sickness influence
    this.qualityFactor = 1;
    // Temporary speed factor due to injury/illness
    this.speedFactor = 1;
    // when pointing to another player, their playerData values are copied for today
    this.todayAsPlayer = null;
    // Bunch of key value maps, where keys are player names (of other players), and values the respective numbers
    this.playedWith = {};
    this.playedAgainst = {};
    this.playedWithFactor = {};
    this.pointsWith = {};
    this.pointsWithFactor = {};
    this.pointsAgainst = {};
    this.pointsAgainstFactor = {};
    this.goalsWith = {};
    this.goalsWithFactor = {};
}

Player.prototype.toJson = function() {
    var json = {
        name: this.name,
        pictureUrl: this.pictureUrl,
        playerData: this.playerData.toJson()
    };
    return json;
};

Player.fromJson = function(json) {
    return new Player(json.name, json.pictureUrl, PlayerData.fromJson(json.playerData));
};

Player.prototype.getPlayerData = function() {
    var result = null;
    if (this.todayAsPlayer) {
        // Copy data of other player today (e.g. injured and only as GK)
        result = this.todayAsPlayer.data.clone();
    }
    if (this.qualityFactor != 1 || this.speedFactor != 1) {
        // Altered quality
        result = PlayerData.applyModification(this.playerData, this.qualityFactor, this.speedFactor);
    }
    // Everything is normal
    if (!result) {
        result = this.playerData.clone();
    }
    // Adjusted quality
    result.adjustedQuality = result.quality + this.getQualityAdjustment();
    // console.log(this.name, ": ", result.quality, " -> ", result.adjustedQuality);
    // Return
    return result;
};

Player.prototype.getPointRatio = function() {
    var games = this.matchCount;
    if (games == 0) { return 0; }
    var points = this.points;
    if (games < 5) {
        points += 1.4 * (5 - games);
        games = 5;
    }
    return points / games;
};

Player.prototype.getGoalRatio = function() {
    var goals = this.goalCount;
    var games = Math.max(5, this.matchCount);
    return goals / games;
};

Player.prototype.addMatch = function(match) {
    var self = this;
    // Assume first team
    var team = 0;
    var matchData = match.team1.filter(function(p) { return p[0] == self });
    if (matchData.length == 0) {
        // Nope, correct to second team
        team = 1;
        matchData = match.team2.filter(function(p) { return p[0] == self });
    }
    // Apply data from match if player was found
    if (matchData.length > 0) {
        matchData = matchData[0];

        // Basic data about goals and points
        this.matches.push(match);
        this.matchDatas.push(matchData);
        this.matchCount++;
        this.goalCount += matchData[1];
        this.ownGoalCount += matchData[2];
        this.switchCount += matchData[3];
        var pts = matchData[3] ? Math.max(match.points[team], match.points[1-team]) : match.points[team];
        this.points += pts;
        if (pts == 0) { this.defeatCount++; } else if (pts == 1) { this.drawCount++; } else { this.winCount++; }

        // Played with and against other players
        var pWith = (team == 0 ? match.team1 : match.team2).map(function(p) { return p[0].name; });
        var pAgainst = (team == 1 ? match.team1 : match.team2).map(function(p) { return p[0].name; });
        for (var p of pWith) { 
            if (p != this.name) {
                this.playedWith[p] = (this.playedWith[p] || 0) + 1; 
                this.playedWithFactor[p] = (5 + this.playedWith[p]) / (5 + (this.playedAgainst[p] || 0));
                this.pointsWith[p] = (this.pointsWith[p] || 0) + pts;
                this.pointsWithFactor[p] = this.pointsWith[p] / this.playedWith[p];
                this.goalsWith[p] = (this.goalsWith[p] || 0) + matchData[1];
                this.goalsWithFactor[p] = this.goalsWith[p] / this.playedWith[p];
            }
        }
        for (var p of pAgainst) {
            this.playedAgainst[p] = (this.playedAgainst[p] || 0) + 1;
            this.playedWithFactor[p] = (5 + (this.playedWith[p] || 0)) / (5 + this.playedAgainst[p]);
            this.pointsAgainst[p] = (this.pointsAgainst[p] || 0) + pts;
            this.pointsAgainstFactor[p] = this.pointsAgainst[p] / this.playedAgainst[p];
        }

        return true;
    } else {
        throw new Error("Player is not part of game for some reason: ", this.toString(), " in ", match.toString());
    }
};

Player.prototype.removeMatch = function(match) {
    var self = this;
    var team = 0;
    var matchData = match.team1.filter(function(p) { return p[0] == self });
    if (matchData.length == 0) {
        team = 1;
        matchData = match.team2.filter(function(p) { return p[0] == self });
    }
    if (matchData.length > 0) {
        matchData = matchData[0];
        var i = this.matches.indexOf(match);
        if (i < 0) {
            throw new Error("Match is not in player's history for some reason: " + match.toString() + " for " + this.toString())
        }
        this.matches.splice(i, 1);
        this.matchCount--;
        this.goalCount -= matchData[1];
        this.ownGoalCount -= matchData[2];
        this.switchCount -= matchData[3];
        var pts = matchData[3] ? Math.max(match.points[team], match.points[1-team]) : match.points[team];
        this.points -= pts;
        if (pts == 0) { this.defeatCount--; } else if (pts == 1) { this.drawCount--; } else { this.winCount--; }

        // Played with and against other players
        var pWith = (team == 0 ? match.team1 : match.team2).map(function(p) { return p[0].name; });
        var pAgainst = (team == 1 ? match.team1 : match.team2).map(function(p) { return p[0].name; });
        for (var p of pWith) { if (p != this.name) { this.playedWith[p] = (this.playedWith[p] || 1) - 1; } }
        for (var p of pAgainst) { this.playedAgainst[p] = (this.playedAgainst[p] || 1) - 1; }

        return true;
    } else {
        throw new Error("Player is not part of game for some reason: " + this.toString() + " in " + match.toString());
        return false;
    }
};

Player.prototype.getTotalTeamScore = function() {
    var self = this;
    var goals = 0;
    var against = 0;
    this.matches.forEach(function(m) {
        var team = m.getPlayerTeamNum(self);
        if (team == 1) {
            goals += m.result[0];
            against += m.result[1];
        } else {
            goals += m.result[1];
            against += m.result[0];
        }
    });
    return [goals, against];
};

/**
 * Adjusted quality is the player's base quality increased or decreased based on how many games they've won or lost in recent time
 * Previous up to 10 games are taken into account, the (timely weighted) diff between won and lost then determines the added value.
 * Having won more than having lost leads to an increase in quality value, and vice versa. Exact values are hardcoded and based on
 * intuition, so may be subject to change.
 */
Player.prototype.getQualityAdjustment = function() {
    var diff = 0;
    var min = 0; // Math.max(0, this.matches.length - 10);
    var won = 0, lost = 0, draw = 0, switches = 0;
    for (var i = this.matches.length - 1; i >= min; i--) {
        var match = this.matches[i];
        if (match.points[0] !== 1 && !match.getPlayerMatchData(this)[3]) {
            // only change diff when match was not a draw, and when player didn't change team
            var team = this.matches[i].getPlayerTeamNum(this);
            if (team > 0) {
                // change depends on degree of domination in that match
                var gdif = Math.abs(this.matches[i].result[1] - this.matches[i].result[0]);
                var factor = 1 + gdif / 8;
                if (this.matches[i].points[team - 1] > 1) {
                    diff += factor;
                    won++;
                } else {
                    diff -= factor;
                    lost++;
                }
            }
        } else {
            if (match.points[0] == 1)
                draw++;
            else
                switches++;
        }
    }
    // console.log("\n", diff.toFixed(1), " based on ", won, draw, lost, " and ", switches, " switches");
    var result = diff; // Math.pow(Math.abs(diff), 1.5) * 2;
    // if (diff < 0) { result = -result; }
    return Math.round(result);
};

Player.prototype.addStatistic = function(name, rank, value) {
    this.statistics.push({
        name: name,
        rank: rank,
        value: value
    });
};

Player.prototype.getFormString = function(count) {
    var first = Math.max(0, this.matches.length - count);
    var s = "";
    var chars = ["L", "D", "?", "W"];
    for (var i = first; i < this.matches.length; i++) {
        var match = this.matches[i];
        var team = match.getPlayerTeamNum(this) - 1;
        s += chars[match.points[team]];
    }
    return s;
};

Player.prototype.getFormPoints = function(count) {
    var first = Math.max(0, this.matches.length - count);
    var points = 0;
    for (var i = first; i < this.matches.length; i++) {
        var match = this.matches[i];
        var team = match.getPlayerTeamNum(this) - 1;
        points += match.points[team];
    }
    return points;
};
