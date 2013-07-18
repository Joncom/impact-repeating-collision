/*
 * @author   Jonathan Commins
 * @email    joncom@gmail.com
 */
ig.module('plugins.joncom.endless-collision-map.collision-map')
.requires('impact.collision-map')
.defines(function() {

    "use strict";

    ig.CollisionMap.inject({

        /*
        trace: function(x, y, vx, vy, objectWidth, objectHeight) {
            console.log(x);
            return this.parent(x, y, vx, vy, objectWidth, objectHeight)
        },
        */

        _wrapTile: function(tile, dimension) {
            if(tile >= dimension) {
                return (tile % dimension);
            } else if(tile < 0) {
                return (dimension - Math.abs(tile % dimension));
            } else {
                return tile;
            }
        },

        _traceStep: function( res, x, y, vx, vy, width, height, rvx, rvy, step ) {

            res.pos.x += vx;
            res.pos.y += vy;

            var t = 0;

            // Horizontal collision (walls)
            if( vx ) {
                var pxOffsetX = (vx > 0 ? width : 0);
                var tileOffsetX = (vx < 0 ? this.tilesize : 0);

                var firstTileY = Math.max( Math.floor(y / this.tilesize), 0 );
                var lastTileY = Math.min( Math.ceil((y + height) / this.tilesize), this.height );
                var tileX = Math.floor( (res.pos.x + pxOffsetX) / this.tilesize );

                // We need to test the new tile position as well as the current one, as we
                // could still collide with the current tile if it's a line def.
                // We can skip this test if this is not the first step or the new tile position
                // is the same as the current one.
                var prevTileX = Math.floor( (x + pxOffsetX) / this.tilesize );
                if( step > 0 || tileX == prevTileX || prevTileX < 0 || prevTileX >= this.width ) {
                    prevTileX = null;
                }

                // Wrap tiles so collision data array can be accessed.
                var tileXWrapped = this._wrapTile(tileX, this.width);
                var prevTileXWrapped;
                if(prevTileX !== null) {
                    prevTileXWrapped = this._wrapTile(prevTileX, this.width);
                }

                for( var tileY = firstTileY; tileY < lastTileY; tileY++ ) {
                    if( prevTileX != null ) {
                        t = this.data[tileY][prevTileXWrapped];
                        if(
                            t > 1 && t <= this.lastSlope &&
                            this._checkTileDef(res, t, x, y, rvx, rvy, width, height, prevTileX, tileY)
                        ) {
                            break;
                        }
                    }

                    t = this.data[tileY][tileXWrapped];
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

                var firstTileX = Math.max( Math.floor(res.pos.x / this.tilesize), 0 );
                var lastTileX = Math.min( Math.ceil((res.pos.x + width) / this.tilesize), this.width );
                var tileY = Math.floor( (res.pos.y + pxOffsetY) / this.tilesize );

                var prevTileY = Math.floor( (y + pxOffsetY) / this.tilesize );
                if( step > 0 || tileY == prevTileY || prevTileY < 0 || prevTileY >= this.height ) {
                    prevTileY = null;
                }

                for( var tileX = firstTileX; tileX < lastTileX; tileX++ ) {
                    if( prevTileY != null ) {
                        t = this.data[prevTileY][tileX];
                        if(
                            t > 1 && t <= this.lastSlope &&
                            this._checkTileDef(res, t, x, y, rvx, rvy, width, height, tileX, prevTileY) ) {
                            break;
                        }
                    }

                    t = this.data[tileY][tileX];
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