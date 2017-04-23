/*
$('#gallery .jeju .my-gallery img').each(function() {
  var img = $(this);
  img.attr('src', img.attr('src') + "?afwe=" + Math.random());
});
*/

function setPhotoSwipeOptions(options) {
  options.mainClass = 'pswp--minimal--dark';
  options.captionEl = false;
  options.fullscreenEl = false;
  options.shareEl = false;
  options.zoomEl = true;
  options.arrowEl = true;
  options.bgOpacity = 0.85;
  //options.tapToClose = true;
}

var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width, center:{x: 0, y: 10}};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        setPhotoSwipeOptions(options);
        options.showHideOpacity = true;

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

initPhotoSwipeFromDOM('.my-gallery');

function showWeddingGalleryScreen(index) {
  var pswpElement = document.querySelectorAll('.pswp')[0];
  var items = [];
  for (var i=0; i < 7; i++) {
    items.push({
      src: 'images/gallery/wedding/l/invi' + i + '.jpg',
      w: 1200,
      h: 800
    });
  }
  var options = {
    index: index
  };
  setPhotoSwipeOptions(options);
  var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
  gallery.init();
}

$(document).ready(function () {
  var win_ratio = 1.0 * $(window).width() / $(window).height();
  if (win_ratio > 1427.0/2000) {
    $('#welcom').css({'background-image': 'images/welcome_bg_wide.jpg'});
  }
  
  var swiper_wrapper = $('.swiper-wrapper');
  for (var i=0; i < 7; i++) {
    var src = 'images/gallery/wedding/s/invi' + i + '.jpg';
    var div = $('<div class="swiper-slide" />');
    var img = $('<img data-src="' + src + '" class="swiper-lazy">');
    var img2 = $('<div class="swiper-lazy-preloader swiper-lazy-preloader-white" />');
    div.append(img);
    div.append(img2);
    swiper_wrapper.append(div);
  }

  var swiper_container = $('.swiper-container');
  var swiper_pagination = $('.swiper-pagination');
  var adjust_swiper_height = function() {
    var w = swiper_container.width();
    if (w == this._sc_pre_width) {
      return;
    }
    this._sc_pre_width = w;
    var h = w * 4 / 6 + swiper_pagination.height();
    swiper_container.height(h);
  };

  var adjust_jeju_gallery = function() {
    if (typeof this._container == 'undefined') {
      this._container = $('.jeju .my-gallery');
      this._pre_w = 0;
      this._items = $(this._container.children('figure'));
    }
    var w = this._container.width();
    if (this._pre_w == w) {
      return;
    }
    this._pre_w = w;
    var padding = parseInt(w * 1 / 100);
    var item_w = (w - padding * 2) / 3;
    var h = this._container.height();
    var item_h = (h - padding * 2) / 3;
    var item_ratio = 1.0 * item_w / item_h;

    this._items.each(function(index, el) {
      el = $(el);
      el.width(item_w);
      var el_ratio = item_ratio;
      if (index == 2 || index == 3) {
        el.height(item_h * 2 + padding);
        el_ratio = 1.0 * el.width() / el.height();
      } else {
        el.height(item_h);
      }
      var img = $(el.find('img'));
      var size = $(el.find('a')).data('size').split('x');
      var img_ratio = parseFloat(size[0]) / parseFloat(size[1]);
      if (img_ratio > el_ratio) {
        img.removeClass('portrait');
      } else {
        img.addClass('portrait');
      }
    });

    var x = item_w + padding;
    var y = item_h + padding;
    $(this._items[0]).css({top: 0, left: 0});
    $(this._items[1]).css({top: 0, left: x});
    $(this._items[2]).css({top: 0, left: x * 2});
    $(this._items[3]).css({top: y, left: 0});
    $(this._items[4]).css({top: y, left: x});
    $(this._items[5]).css({top: y * 2, left: x});
    $(this._items[6]).css({top: y * 2, left: x * 2});
  };

  adjust_jeju_gallery();
  $('#gallery .jeju .my-gallery img').load(function() {
    adjust_jeju_gallery();
  });

  $(window).resize(adjust_swiper_height);
  $(window).resize(adjust_jeju_gallery);

  var mySwiper = new Swiper ('.swiper-container', {
    loop: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    preloadImages: false,
    lazyLoadingInPrevNextAmount: 2,
    lazyLoadingInPrevNext: true,
    lazyLoading: true
  });
  adjust_swiper_height();

  $('.swiper-slide').click(function() {
    var i = $(this).data('swiper-slide-index');
    showWeddingGalleryScreen(i);
  });
});
