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

      // declare function that calculate polaroid borders

      var calculateHeight = function(w) {
        return Math.round(w * 1.24415204678363)
      }

      var calculateSidePadding = function(w) {
        return Math.round(w/17)
      }

      var calculateTopPadding = function(sidePadding) {
        return Math.round(sidePadding * (3/2))
      }

      var sidePadding = calculateSidePadding(w)

      this.effects['polaroid'] = {
        w   :   w,
        h   :   calculateHeight(w),
        sidePadding :sidePadding,
        topPadding  : calculateTopPadding(sidePadding),
        bottomPadding : sidePadding * 4,
        // updates the width of the passed in polaroid param
        setW : function(w,p) {
          p.w   = w
          p.h   = calculateHeight(w)
          p.sidePadding = calculateSidePadding(w)
          p.topPadding  = calculateTopPadding(p.sidePadding)
          p.bottomPadding = p.sidePadding * 4
        }
      }

      return this
    },
    reflection   : function(url) {
      this.effects['reflection'] = {}
      return this
    },
    border       : function(tPadding,bPadding,lPadding,rPadding,borderColor) {
      if (bPadding == null && lPadding == null && rPadding == null) {
        bPadding = lPadding = rPadding = tPadding
      }
      if (borderColor == null)
        borderColor = 0xCCCCCCFF // 0xF8F8F8FF

      this.effects['border'] = {bPadding:bPadding, lPadding:lPadding, rPadding:rPadding, tPadding:tPadding, borderColor:borderColor}
      return this
    }
  }
}
