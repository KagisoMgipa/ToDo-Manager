(function($) {
    var $window = $(window),
        $body = $('body'),
        $wrapper = $('#page-wrapper'),
        $banner = $('#banner'),
        $header = $('#header');

    // Breakpoints.
    breakpoints({
        xlarge:   [ '1281px',  '1680px' ],
        large:    [ '981px',   '1280px' ],
        medium:   [ '737px',   '980px'  ],
        small:    [ '481px',   '736px'  ],
        xsmall:   [ null,      '480px'  ]
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Mobile?
    if (browser.mobile)
        $body.addClass('is-mobile');
    else {
        breakpoints.on('>medium', function() {
            $body.removeClass('is-mobile');
        });

        breakpoints.on('<=medium', function() {
            $body.addClass('is-mobile');
        });
    }

    // Scrolly.
    $('.scrolly')
        .scrolly({
            speed: 1500,
            offset: $header.outerHeight()
        });

    // Menu.
    $('#menu')
        .append('<a href="#menu" class="close"></a>')
        .appendTo($body)
        .panel({
            delay: 500,
            hideOnClick: true,
            hideOnSwipe: true,
            resetScroll: true,
            resetForms: true,
            side: 'right',
            target: $body,
            visibleClass: 'is-menu-visible'
        });

    // Header.
    if ($banner.length > 0 && $header.hasClass('alt')) {
        $window.on('resize', function() { $window.trigger('scroll'); });

        $banner.scrollex({
            bottom: $header.outerHeight() + 1,
            terminate: function() { $header.removeClass('alt'); },
            enter: function() { $header.addClass('alt'); },
            leave: function() { $header.removeClass('alt'); }
        });
    }

    // Get the modal
    var modal = document.getElementById("requestTutorModal");

    // Get the button that opens the modal
    var btn = document.getElementById("openModalBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
        setTimeout(function() {
            modal.style.opacity = 1;
            var modalContent = document.querySelector(".modal-content");
            modalContent.style.opacity = 1;
            modalContent.style.transform = "translateY(0)";
        }, 10); // Short delay to ensure the transition effect

        // Load the login.html content
        fetch('login.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('modalContainer').innerHTML = data;
            })
            .catch(error => console.error('Error loading login modal:', error));
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.opacity = 0;
        var modalContent = document.querySelector(".modal-content");
        modalContent.style.opacity = 0;
        modalContent.style.transform = "translateY(-50px)";
        setTimeout(function() {
            modal.style.display = "none";
        }, 500); // Match the transition duration
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.opacity = 0;
            var modalContent = document.querySelector(".modal-content");
            modalContent.style.opacity = 0;
            modalContent.style.transform = "translateY(-50px)";
            setTimeout(function() {
                modal.style.display = "none";
            }, 500); // Match the transition duration
        }
    }

})(jQuery);
