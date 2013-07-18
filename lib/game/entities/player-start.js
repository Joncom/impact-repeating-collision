ig.module('game.entities.player-start')
.requires('impact.entity')
.defines(function() {

	EntityPlayerStart = ig.Entity.extend({

		size: {
			x: 8,
			y: 8
		}

	});

});