// imageEffects.js

module.exports = function() { 

  return {
    effects      : {},
    // adds a shadow over the image
    topShadow   : function(url) {
      this.effects['topShadow'] = {url:url}
      return this
    },
      // adds a drop shadow under the image
      dropShadow   : function(url,size) {
      this.effects['dropShadow'] = {url:url,size:size}
      return this
    },
    // adds a polaroid effect to the image
    polaroid   : function(w) {

      var sidePadding = Math.round(w/17)

      this.effects['polaroid'] = {
        w   :   w,
        h   :   Math.round(w * 1.24415204678363),
        sidePadding :sidePadding,
        topPadding  : Math.round(sidePadding * (3/2)),
        bottomPadding : sidePadding * 4,
        setW : function(w,p) {
          p.w   = w
          p.h   = Math.round(w * 1.24415204678363)
          p.sidePadding = Math.round(w/17)
          p.topPadding  = Math.round(p.sidePadding * (3/2))
          p.bottomPadding = p.sidePadding * 4
        }
      }

      return this
    },
    reflection   : function(url) {
      this.effects['reflection'] = {}
      return this
    },
    border       : function(padding) {
      this.effects['border'] = {padding:padding}
      return this
    }
  }
}
