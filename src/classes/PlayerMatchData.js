
/**
 * Information about a player's performance in a single match.
 */
function PlayerMatchData(player, matchday, goals, ownGoals, changedTeams, goalsForOtherTeam, ownGoalsForOtherTeam) {
  this.player = player;
  this.matchday = matchday;
  this.goals = goals || 0;
  this.ownGoals = ownGoals || 0;
  this.changedTeams = !!changedTeams;
  this.goalsForOtherTeam = goalsForOtherTeam || 0;
  this.ownGoalsForOtherTeam = ownGoalsForOtherTeam || 0;
}

PlayerMatchData.prototype.toJson = function() {
  return {
    player: this.player.name,
    matchday: this.matchday.date,
    goals: this.goals,
    ownGoals: this.ownGoals,
    changedTeams: this.changedTeams,
    goalsForOtherTeam: this.goalsForOtherTeam,
    ownGoalsForOtherTeam: this.ownGoalsForOtherTeam
  };
};

PlayerMatchData.fromJson = function(json, matchday) {
  return new PlayerMatchData(
    app.getPlayer(json.player),
    matchday || app.getMatchday(json.matchday),
    json.goals,
    json.ownGoals,
    json.changedTeams,
    json.goalsForOtherTeam,
    json.ownGoalsForOtherTeam
  );
};

PlayerMatchData.prototype.getGoalsFor = function() {
  return this.goals + this.ownGoalsForOtherTeam;
};

PlayerMatchData.prototype.getGoalsAgainst = function() {
  return this.ownGoals + this.goalsForOtherTeam;
};
