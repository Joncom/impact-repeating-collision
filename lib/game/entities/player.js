ig.module('game.entities.player')
.requires('impact.entity')
.defines(function() {

    EntityPlayer = ig.Entity.extend({

        _wmIgnore: true,
        size: { x: 8, y: 8 },
        speed: { x: 95, y: 195 },
        maxVel: { x: 110, y: 200 },
        friction: { x: 300, y: 0 },
        facingLeft: false,
        gravityFactor: 3,
        animSheet: new ig.AnimationSheet('media/tiles.png', 8, 8),

        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [2]);
        },

        update: function() {
            this.parent();
            if(this.standing) {
                if(ig.input.pressed('up')) {
                    this.vel.y = -this.speed.y;
                    this.falling = false;
                }
            } else {
                // we're not standing, jump has been released and we're not falling
                // we reduce the y velocity and mark us as falling
                if(!this.standing && !ig.input.state('up') && !this.falling) {
                    this.vel.y = Math.floor(this.vel.y / 2);
                    this.falling = true;
                }
            }

            if(ig.input.state('left')) {
                this.vel.x = -this.speed.x;
            } else if(ig.input.state('right')) {
                this.vel.x = this.speed.x;
            } else {
                this.accel.x = 0;
            }
        }

    });

});