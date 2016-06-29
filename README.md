# pxComponents

A framework for using [pxscene](http://www.pxscene.org/)

![](https://raw.githubusercontent.com/diatrophy/pxComponents/master/docs/images/pxComponents.png)

## Usage

pxComponents simplifies the creation of pxscene objects like **Image** and helps add effects and animation

    // image rendered with polaroid, drop shadow and top shadow
    var p1 = pxImageRenderer.render(pxImage({url:photoUrl,parent:root,x:50,y:50,sx:0.10,sy:0.10})
                .addEffects(pxImageEffects()
                  .polaroid(shadowUrl)
                  .topShadow(bgDropShadowUrl)
                  .dropShadow(shadowUrl)
                ))

**For more info checkout the ** [wiki](https://github.com/diatrophy/pxComponents/wiki)

# Common Documentation locations -

- http://johnrobinsn.github.io/pxScene2d/docs/
