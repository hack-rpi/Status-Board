<?php

function getCommit($user, $repo) {
  $curl = curl_init();
  $api_url = "http://api.github.com/repos/";
  $url = $api_url.$user."/".$repo."/commits";

  // $token = ***REMOVED***;
  // $url = $url."/?access_token=".$token;

  $url = "http://catfacts-api.appspot.com/api/facts";

  curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url,
    CURLOPT_SSL_VERIFYPEER => false,
  ));

  $content = curl_exec($curl);
  $data = json_decode($content, true);

  curl_close($curl);
  // var_dump($content);
  return $data;

  // $result = file_get_contents($url);
  //
  // $result = json_decode($response);
  // return $result;
}

$myVar = "I am a variable.";
$commit_message = getCommit("mpoegel", "HackRPI-Status-Board");

$cat = $commit_message["facts"][0];
// $cat = "cat fact!";

?>

<!DOCTYPE/>
<html lang="en">
<head>
  <title>HackRPI Status Board</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="decription" content="The official HackRPI status board for the event! Stay updated with anoucements and everyone's committ messages.">

	<link href="style/bootstrap.css" rel="stylesheet">
	<link href="style/bootstrap-theme.css" rel="stylesheet">

	<link href="style/main.css" rel="stylesheet">

  <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!-- [if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

</head>
<body>

  <div class="header">
			<div class="container">
				<img src="img/hackrpi-logo.png" />
			</div>
    </div>

  <div class="container">
    <h1>HackRPI Status Board</h1>

    <div class="row">
      <div class="col-md-8 well">
        <h3>Commit Messages</h3>
        <?php echo $cat; ?>
      </div>
      <div class="col-md-4">
        <div class="row">
          <div class="col-md-12 well">
            <h3>Annoucements</h3>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 well">
            <h3>HackRPI Twitter Feed</h3>
            <!-- lol that was easy -->
            <a class="twitter-timeline"  href="https://twitter.com/goHackRPI" data-widget-id="523304485175558145">Tweets by @goHackRPI</a>
            <script>
              !function(d,s,id){
                var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
                if (!d.getElementById(id)){
                  js=d.createElement(s);
                  js.id=id;
                  js.src=p+"://platform.twitter.com/widgets.js";
                  fjs.parentNode.insertBefore(js,fjs);
                }
              }(document,"script","twitter-wjs");
            </script>
          </div>
        </div>
      </div>
    </div>

  </div>


  <div class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          Copyright 2014 Rensselaer Hackathon Organization
        </div>
      </div>
    </div>
  </div>


  <script src="script/jquery-2.1.1.min.js"></script>
  <script src="script/bootstrap.js"></script>
</body>

</html>
