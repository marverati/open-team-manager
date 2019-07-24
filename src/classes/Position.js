
/*
    A player's position information, both values between 0 and 1, how much the player helps in this regard
    The sum doesn't need to be 1 though. A great midfielder might have 0.8 in both. A great defender may still have 0.4 in attacking.
    The typical full back will get 0.6 defensively and 0.4 offensively. Central backs would probably get 1.0 and 0.1 or so.
*/
function Position(defends, attacks) {
    this.defends = defends;
    this.attacks = attacks;
}

Position.prototype.toJson = function() {
    return [this.defends, this.attacks];
};

Position.fromJson = function(json) {
    return new Position(json[0], json[1]);
};
