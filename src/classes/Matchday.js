

/*
    A matchday containing information about a single game that was played.
    date - the date object
    team1 - Array of PlayerMatchData objects of first team
    team2 - same for the second team
*/
function Matchday(date, team1, team2, weather) {
    this.date = date || new Date();
    this.team1 = [];
    this.team2 = [];
    this.points = [-1, -1];
    this.result = [-1, -1];
    this.weather = (weather == null || isNaN(weather)) ? 5 : weather;
    this.setTeams(team1, team2);
}

Matchday.prototype.toJson = function() {
    var json = {
        date: dateToString(this.date),
        team1: this.team1.map(pmData => pmData.toJson()),
        team2: this.team2.map(pmData => pmData.toJson()),
        weather: this.weather
    };
    return json;
};

Matchday.fromJson = function(json) {
    return new Matchday(
        dateFromString(json.date),
        json.team1.map(data => PlayerMatchData.fromJson(data, this)),
        json.team2.map(data => PlayerMatchData.fromJson(data, this)),
        json.weather
    );
};

Matchday.prototype.setTeams = function(team1, team2) {
    var self = this;
    // Inform previous players that they're not part of this matchday anymore
    this.team1.forEach(function(p) { p.player.removeMatch(self); });
    this.team2.forEach(function(p) { p.player.removeMatch(self); });
    this.team1 = team1;
    this.team2 = team2;
    this.result = [
        getTeamGoals(team1, team2),
        getTeamGoals(team2, team1)
    ];
    this.points = (this.result[0] == this.result[1]) ? [1, 1] : (this.result[0] > this.result[1] ? [3, 0] : [0, 3]);
    // Apply to players
    var self = this;
    team1.forEach(function(p) { p.player.addMatch(self); });
    team2.forEach(function(p) { p.player.addMatch(self); });

    function getTeamGoals(team1, team2) {
        return team1.reduce(function(goals, p) { return goals + p.getGoalsFor(); }, 0) +
               team2.reduce(function(goals, p) { return goals + p.getGoalsAgainst(); }, 0);
    }
};

Matchday.prototype.getResultString = function() {
    return this.result[0] + ":" + this.result[1];
};

Matchday.prototype.getPlayerCount = function() {
    return this.team1.length + this.team2.length;
};

Matchday.prototype.getGoalCount = function() {
    return this.result[0] + this.result[1];
};

Matchday.prototype.getPlayerTeamNum = function(p) {
    for (var i = 0; i < this.team1.length; i++) {
        if (this.team1[i].player == p) {
            return 1;
        }
    }
    for (var i = 0; i < this.team2.length; i++) {
        if (this.team2[i].player == p) {
            return 2;
        }
    }
    return 0;
};

/**
 * Returns the player's match data, which is an array containing [player, goals, ownGoals, changedTeams]
 * @param {Player} p 
 */
Matchday.prototype.getPlayerMatchData = function(p) {
    for (var i = 0; i < this.team1.length; i++) {
        if (this.team1[i].player == p) {
            return this.team1[i];
        }
    }
    for (var i = 0; i < this.team2.length; i++) {
        if (this.team2[i].player == p) {
            return this.team2[i];
        }
    }
    return [];
};
