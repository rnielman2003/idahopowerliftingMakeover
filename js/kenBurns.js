(function(){
  document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
  window.setInterval(kenBurns, 4000);       
  var images                = document.getElementById('slideshow').getElementsByTagName('img'),
      numberOfImages    = images.length,
      i                         = 1;  // we want to start with the second image as the first one is styled onload
  function kenBurns() {
        // if we have gone through all images, we reset the variable for the loop
        if(i==numberOfImages){ i = 0;}
        images[i].className = "fx";
        // we can't remove the class from the previous element or we'd get a bouncing effect so we clean up the one before last
        // there must be a smarter way to do this though
        if(i===0){ images[numberOfImages-2].className = "";}
        if(i===1){ images[numberOfImages-1].className = "";}
        if(i>1){ images[i-2].className = "";}
        i++;
    }
})();