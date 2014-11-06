if (Meteor.isClient) {

  Template.carousel.carouselItems = function() {
    // populate the carousel dynamically with the appropriate annoucements
    Meteor.subscribe("Announcements");

    var msgs = Announcements.find().fetch();
    console.log(msgs);
    // hide the carousel if no announcements need to be shown
    if (msgs.length == 0) {
      console.log("here");
      $("#myCarousel").addClass("hidden");
      return;
    }

    console.log("mreh");

    $("#myCarousel").removeClass("hidden");

    for (var i=0; i<msgs.length; i++) {
      if (i == 0) {
        $("#myCarousel ol").append('<li data-target="#myCarousel" class="active" data-slide-to=' + (i) + '></li>');

        $("#carousel-items").append('\
          <div class="item active"> \
            <div class="container"> \
              <div class="carousel-caption"> \
                <h1>' + msgs[i]['header'] + ' \
                <p> ' + msgs[i]['text'] + ' \
              </div> \
            </div> \
          </div> \
        ');
      }
      else {
        $("#myCarousel ol").append('<li data-target="#myCarousel" data-slide-to=' + (i) + '></li>');

        $("#carousel-items").append('\
          <div class="item"> \
            <div class="container"> \
              <div class="carousel-caption"> \
                <h1>' + msgs[i]['header'] + '</h1> \
                <p>' + msgs[i]['text'] + '</p> \
              </div> \
            </div> \
          </div> \
        ');

      }


    }

  }

}
