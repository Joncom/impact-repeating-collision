ig.module('game.main')
.requires(
    //'impact.debug.debug',
    'impact.game',
    'impact.font',
    'plugins.joncom.endless-collision-map.collision-map',
    'game.levels.test',
    'game.entities.player'
)
.defines(function(){

    MyGame = ig.Game.extend({

        gravity: 100,

        init: function() {
            ig.input.bind( ig.KEY.UP_ARROW, 'up' );
            ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
            ig.input.bind( ig.KEY.W, 'up' );
            ig.input.bind( ig.KEY.D, 'down' );
            ig.input.bind( ig.KEY.A, 'left' );
            ig.input.bind( ig.KEY.D, 'right' );

            this.loadLevel(LevelTest);
        },

        loadLevel: function(level) {
            this.parent(level);

            var start = this.getEntitiesByType(EntityPlayerStart)[0];
            if(start) {
                ig.game.player = this.spawnEntity(EntityPlayer, start.pos.x, start.pos.y);
                start.kill();
            }
        },

        draw: function() {
            this.screen.x = this.player.pos.x + this.player.size.x/2 - ig.system.width/2;
            this.screen.y = this.player.pos.y + this.player.size.y/2 - ig.system.height/2;
            this.parent();
        }

    });

    ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
