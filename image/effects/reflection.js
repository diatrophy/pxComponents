// reflection.js

module.exports =  function(scene,uiImage,callbackList) {
    
    var effects = uiImage.effects.effects,
        image   = uiImage['image']
   
    // register a callback to re-size the top shadow after the image has been rendered
    callbackList.push(function(uiImage,scale){

        var w = 180;
        var h = 240;
        var tr = scene.create({t:"image",parent:uiImage.image,w:w,h:h,cx:w/2,cy:h,rx:1,rz:0,r:180,sx:1.0,sy:0.5,});
        var tr2 = scene.create({t:"image",resource:uiImage.image.resource,parent:tr,w:w,h:h,a:0.1});
  
    })

}
