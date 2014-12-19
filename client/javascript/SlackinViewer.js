/**
 * A responsive viewer for Messages
 *
 * @name SlackinViewer
 * @constructor
 * @param {HTMLElement} the element that brings up the viewer
 * @param {HTMLElement} the thumbnail image
 * @param {number} the index number to start viewer
 * @example
 * var viewer = new SlackinViewer(thumbnailTrigger, thumbnailImage, 0);
 */
function SlackinViewer(thumbnailTrigger, thumbnailImage, thumbnailIndex) {
  this.thumbnailTrigger = thumbnailTrigger;
  this.thumbnailImage   = thumbnailImage;
  this.thumbnailIndex   = thumbnailIndex;
  this.timer            = null;
  this.preloadedImage   = document.images && new Image();

  // cache HTMLElement for performance
  this.elements         = {
    slackinViewer: document.getElementById('slackin-viewer'),
    mask         : document.querySelector('.mask'),
    image        : document.querySelector('.image'),
    previous     : document.querySelector('.previous'),
    next         : document.querySelector('.next'),
    description  : document.querySelector('.description'),
    controls     : document.querySelectorAll('.controls'),
    close        : document.querySelector('.close')
  };

  this.states           = {
    currentIndex: 0,
    next        : false,
    previous    : false
  };

  this.keyCode          = {
    escape: 27,
    left  : 37,
    right : 39
  };

  this.requestPhotoSet();
  this.attachEventHandlers();
}

/**
 * AJAX call to Flickr API for collection of images and titles
 *
 * @name requestPhotoSet
 */
SlackinViewer.prototype.requestPhotoSet = function() {
  var self    = this,
      url     = 'server/FlickrPhotos.php',
      request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      self.items = JSON.parse(request.responseText);
      self.length = Object.keys(self.items).length;
      self.updateThumbnail();
    }
  };

  request.open('GET', url, true);
  request.send();
};

/**
 * Brings up the viewer
 *
 * @name show
 */
SlackinViewer.prototype.show = function() {
  if (!this.thumbnailTrigger.classList.contains('fetching')) {
    this.states.currentIndex = 0;
    this.updateViewer(this.states.currentIndex);
    this.preloadImage(this.states.currentIndex + 1);
    this.elements.slackinViewer.classList.add('active');
  }
};

/**
 * Takes away the viewer
 *
 * @name hide
 */
SlackinViewer.prototype.hide = function() {
  var self = this;

  self.elements.slackinViewer.classList.add('stealth');
  clearTimeout(self.timer);

  setTimeout(function() {
    self.elements.slackinViewer.classList.remove('active', 'stealth');
  }, 150);
};

/**
 * Shows the image in the thumbnail spot for the Message
 *
 * @name updateThumbnail
 */
SlackinViewer.prototype.updateThumbnail = function() {
  this.thumbnailImage.src = this.items[this.thumbnailIndex].src;
  this.thumbnailImage.alt = this.items[this.thumbnailIndex].title;
  this.thumbnailTrigger.classList.remove('fetching');
};

/**
 * Updates the viewer with the current image and title
 *
 * @name updateViewer
 * @param {number} the index number of the collection to show
 */
SlackinViewer.prototype.updateViewer = function(index) {
  var item = this.items;

  if (item && item[index]) {
    this.elements.image.src = this.items[index].src;
    this.elements.image.alt = this.items[index].title;
    this.elements.description.innerHTML = this.items[index].title || 'Open in a new tab';

    this.updateControlsState(index);
    this.states.currentIndex = index;
  }
};

/**
 * Control button to move to the previous image
 *
 * @name previous
 */
SlackinViewer.prototype.previous = function() {
  var items = this.items;

  if (!this.states.previous) {
    this.updateViewer(this.states.currentIndex - 1);
    this.preloadImage(this.states.currentIndex - 1);
  }
};

/**
 * Control button to move to the next image
 *
 * @name next
 */
SlackinViewer.prototype.next = function() {
  var items = this.items;

  if (!this.states.next) {
    this.updateViewer(this.states.currentIndex + 1);
    this.preloadImage(this.states.currentIndex + 1);
  }
};

/**
 * Maintains control states
 *
 * @name updateControlState
 * @param {number} the number to store
 */
SlackinViewer.prototype.updateControlsState = function(index) {
  if (index <= 0) {
    this.states.previous = this.updateControlUI('previous');
  } else {
    if (this.states.previous) {
      this.states.previous = this.updateControlUI('previous');
    }
  }

  if (index >= this.length - 1) {
    this.states.next = this.updateControlUI('next');
  } else {
    if (this.states.next) {
      this.states.next = this.updateControlUI('next');
    }
  }
};

/**
 * Updates the presentation
 *
 * @name updateControlUI
 * @param {NodeList} A NodeList of control HTMLElements
 */
SlackinViewer.prototype.updateControlUI = function(control) {
  return this.elements[control].classList.toggle('disabled');
};

SlackinViewer.prototype.setTimer = function() {
  var self = this,
      controls = self.elements.controls;

  clearTimeout(self.timer);

  for (var i = controls.length - 1; i >= 0; i--) {
    controls[i].classList.remove('stealth');
  };

  self.timer = setTimeout(function() {
    for (var i = controls.length - 1; i >= 0; i--) {
      controls[i].classList.toggle('stealth');
    };

  }, 5000);
};

/**
 * For a better user experience, preload next or previous image
 *
 * @name preloadImage
 * @param {number} current index state number
 */
SlackinViewer.prototype.preloadImage = function(index) {
  var src = this.items[index] && this.items[index].src;

  if (src) {
    this.preloadedImage.src = src;
  }
};

/**
 * Attach the event handlers used for the viewer
 *
 * @name attachEventHandlers
 */
SlackinViewer.prototype.attachEventHandlers = function() {
  var self = this;

  /* Show event handler */
  self.thumbnailTrigger.addEventListener('click', function() {
    self.show();
  }, false);

  /* Hide event handler */
  self.elements.mask.addEventListener('click', function() {
    self.hide();
  }, false);
  self.elements.close.addEventListener('click', function() {
    self.hide();
  }, false);

  /* Previous event handler */
  self.elements.previous.addEventListener('click', function() {
    self.previous();
  }, false);

  /* Next event handler */
  self.elements.next.addEventListener('click', function() {
    self.next();
  }, false);

  /* Mouse event handler to toggle showing description when hovering image */
  self.elements.image.addEventListener('mouseover', function() {
    self.elements.description.classList.toggle('exposed');
  }, false);
  self.elements.image.addEventListener('mouseout', function() {
    self.elements.description.classList.toggle('exposed');
  }, false);
  self.elements.slackinViewer.addEventListener('mousemove', function() {
    self.setTimer();
  }, false);

  /* Keyboard event handler */
  window.addEventListener('keyup', function(evt) {
    if (evt.keyCode === self.keyCode.left) {
      self.previous();
    }

    if (evt.keyCode === self.keyCode.right) {
      self.next();
    }

    if (evt.keyCode === self.keyCode.escape) {
      self.hide();
    }
  }, false);
};