(function(document) {
  var thumbnailTrigger = document.querySelector('.thumbnail-trigger'),
      thumbnailImage   = document.querySelector('.thumbnail-image'),
      viewer           = new SlackinViewer(thumbnailTrigger, thumbnailImage, 0);
}(document));