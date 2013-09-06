ig.module('plugins.joncom.repeating-collision.collision-map')
.requires('impact.collision-map')
.defines(function() {

    "use strict";

    ig.CollisionMap.inject({

        _wrapTile: function(tile, dimension) {
            var remainder = tile % dimension;
            if(tile >= dimension) {
                return remainder;
            } else if(tile < 0 && remainder === 0) {
                return 0;
            } else if(tile < 0 && remainder !== 0) {
                return (dimension - Math.abs(remainder));
            } else {
                return tile;
            }
        },

        // The is a modified _traceStep function that
        // overloads its counterpart in the collision-map
        // module. Most of the code is the same, so perform
        // a 'diff' on the two to see what has changed.
        _traceStep: function( res, x, y, vx, vy, width, height, rvx, rvy, step ) {

            res.pos.x += vx;
            res.pos.y += vy;

            var t = 0;

            // Horizontal collision (walls)
            if( vx ) {
                var pxOffsetX = (vx > 0 ? width : 0);
                var tileOffsetX = (vx < 0 ? this.tilesize : 0);

                var firstTileY = Math.floor(y / this.tilesize);
                var lastTileY = Math.ceil((y + height) / this.tilesize);
                var tileX = Math.floor( (res.pos.x + pxOffsetX) / this.tilesize );

                // We need to test the new tile position as well as the current one, as we
                // could still collide with the current tile if it's a line def.
                // We can skip this test if this is not the first step or the new tile position
                // is the same as the current one.
                var prevTileX = Math.floor( (x + pxOffsetX) / this.tilesize );
                if( step > 0 || tileX == prevTileX ) {
                    prevTileX = null;
                }

                var tileXWrapped = this._wrapTile(tileX, this.width);

                for( var tileY = firstTileY; tileY < lastTileY; tileY++ ) {

                    var tileYWrapped = this._wrapTile(tileY, this.height);

                    if( prevTileX != null ) {
                        var prevTileXWrapped = this._wrapTile(prevTileX, this.width);
                        t = this.data[tileYWrapped][prevTileXWrapped];
                        if(
                            t > 1 && t <= this.lastSlope &&
                            this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)
                        ) {
                            break;
                        }
                    }

                    t = this.data[tileYWrapped][tileXWrapped];
                    if(
                        t == 1 || t > this.lastSlope || // fully solid tile?
                        (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
                    ) {
                        if( t > 1 && t <= this.lastSlope && res.collision.slope ) {
                            break;
                        }

                        // full tile collision!
                        res.collision.x = true;
                        res.tile.x = t;
                        x = res.pos.x = tileX * this.tilesize - pxOffsetX + tileOffsetX;

                        rvx = 0;
                        break;
                    }
                }
            }

            // Vertical collision (floor, ceiling)
            if( vy ) {
                var pxOffsetY = (vy > 0 ? height : 0);
                var tileOffsetY = (vy < 0 ? this.tilesize : 0);

                var firstTileX = Math.floor(res.pos.x / this.tilesize);
                var lastTileX = Math.ceil((res.pos.x + width) / this.tilesize);
                var tileY = Math.floor( (res.pos.y + pxOffsetY) / this.tilesize );

                var prevTileY = Math.floor( (y + pxOffsetY) / this.tilesize );
                if( step > 0 || tileY == prevTileY ) {
                    prevTileY = null;
                }

                var tileYWrapped = this._wrapTile(tileY, this.height);

                for( var tileX = firstTileX; tileX < lastTileX; tileX++ ) {

                    var tileXWrapped = this._wrapTile(tileX, this.width);

                    if( prevTileY != null ) {
                        var prevTileYWrapped = this._wrapTile(prevTileY, this.height);
                        t = this.data[prevTileYWrapped][tileXWrapped];
                        if(
                            t > 1 && t <= this.lastSlope &&
                            this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY) ) {
                            break;
                        }
                    }

                    t = this.data[tileYWrapped][tileXWrapped];
                    if(
                        t == 1 || t > this.lastSlope || // fully solid tile?
                        (t > 1 && this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, tileY)) // slope?
                    ) {
                        if( t > 1 && t <= this.lastSlope && res.collision.slope ) {
                            break;
                        }

                        // full tile collision!
                        res.collision.y = true;
                        res.tile.y = t;
                        res.pos.y = tileY * this.tilesize - pxOffsetY + tileOffsetY;
                        break;
                    }
                }
            }

            // res is changed in place, nothing to return
        }

    });

});