
/*
    Values:
    position - Position object containing information about defensive abilities and such
    quality - Value usually between 0 and 100, how good the player is generally
    gkQuality - Value between 0 and 100, how good player is in goal
    speed - whole number from 0 to 5, 0 meaning stationary, 1 = very slow and immobile, 3 = normal 40+ year old, 5 = really fast
    stamina - value from 0 to 5, 5 meaning they're running throughout the whole game and never get tired
    size - value from 0 to 5, 5 meaning they're very physical and great at headers, 3 being normal, and 0 meaning they shy away from any contact
    gkMinutes - the expected minutes this player is in goal; between 0 and 90
    playmaker - value from 0 to 5, how much the player can be considered a playmaker who directs a team's playstyle
    goalRatio - the expected goals per game of this player
    vision - value from 0 to 5, how much a player prefers to play the ball to his team mates than to proceed on his own
    mood - value from 0 to 5; the lower, the greater the tendency to get into a bad mood when things aren't going well
*/
function PlayerData(position, quality, gkQuality, speed, stamina, size, gkMinutes, playmaker, goalRatio, vision, mood) {
    this.position = position;
    this.quality = quality;
    this.gkQuality = gkQuality;
    this.speed = speed;
    this.stamina = stamina;
    this.size = size;
    this.gkMinutes = gkMinutes;
    this.playmaker = playmaker;
    this.goalRatio = goalRatio;
    this.vision = vision || 3;
    this.mood = mood || 3;
}

PlayerData.prototype.clone = function() {
    return new PlayerData(this.position, this.quality, this.gkQuality, this.speed, this.stamina, this.size, this.gkMinutes, this.playmaker, this.goalRatio, this.vision, this.mood);
};

PlayerData.prototype.toJson = function() {
    var json = {
        p: this.position.toJson(),
        q: this.quality,
        gq: this.gkQuality,
        sp: this.speed,
        st: this.stamina,
        sz: this.size,
        gm: this.gkMinutes,
        pm: this.playmaker,
        gr: this.goalRatio,
        vs: this.vision,
        md: this.mood
    };
    return json;
};

PlayerData.fromJson = function(json) {
    return new PlayerData(Position.fromJson(json.p), json.q, json.gq, json.sp, json.st, json.sz, json.gm, json.pm, json.gr, json.vs, json.md);
};

PlayerData.applyModification = function(data, qualityF, speedF) {
    var data = data.clone();
    data.quality *= qualityF;
    data.speed *= speedF;
    data.stamina *= speedF;
    return data;
};
