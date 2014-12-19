<?php
#
# build the API URL to call for contents
#

$params = array(
  'api_key' => '56f7fa32c945a4c190618d20c8b6fa27',
  'method'  => 'flickr.photosets.getPhotos',
  'photoset_id'  => '72157626865875079',
  'format'  => 'json',
  'nojsoncallback' => '1',
  'extras' => 'url_o',
);

$encoded_params = array();

foreach ($params as $k => $v) {
  $encoded_params[] = urlencode($k).'='.urlencode($v);
}

#
# call the API
#

$url = "https://api.flickr.com/services/rest/?".implode('&', $encoded_params);

$data = json_decode(file_get_contents($url), true);
$photos = $data['photoset']['photo'];

$ret_photos = array();

if (!empty($photos)) {
  foreach ($photos as $photo) {
    $ret_photo = array();
    $src = $photo['url_o'];

    $ret_photo['src'] = $src;
    $ret_photo['title'] = $photo['title'];

    $ret_photos[] = $ret_photo;

    unset($ret_photo);
  }
}

echo json_encode($ret_photos, JSON_FORCE_OBJECT);
