<?php
// Copyright 2019 Oath Inc. Licensed under the terms of the zLib license see https://opensource.org/licenses/Zlib for terms.
header("Access-Control-Allow-Headers: content-type");
header("Content-type: application/json");
header("Access-Control-Allow-Origin: *");

$city = $_GET['city'];
$region = $_GET['region'];
$country_code = $_GET['country_code'];

function buildBaseString($baseURI, $method, $params) {
	$r = array();
	ksort($params);
	foreach ($params as $key => $value) {
		$r[] = "$key=" . rawurlencode($value);
	}
	return $method . "&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $r));
}
function buildAuthorizationHeader($oauth) {
	$r = 'Authorization: OAuth ';
	$values = array();
	foreach ($oauth as $key => $value) {
		$values[] = "$key=\"" . rawurlencode($value) . "\"";
	}
	$r .= implode(', ', $values);
	return $r;
}
$url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
$app_id = 'jdXYS96q';
$consumer_key = 'dj0yJmk9RXdERHk1VWVvcm1VJmQ9WVdrOWFtUllXVk01Tm5FbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWZi';
$consumer_secret = '8676500e64168748b40ad2f7ccdc4a043d2ed7c0';
$query = array(
	'location' => $city . ',' . $region . ',' . $country_code,
	'format' => 'json',
);
$oauth = array(
	'oauth_consumer_key' => $consumer_key,
	'oauth_nonce' => uniqid(mt_rand(1, 1000)),
	'oauth_signature_method' => 'HMAC-SHA1',
	'oauth_timestamp' => time(),
	'oauth_version' => '1.0',
);
$base_info = buildBaseString($url, 'GET', array_merge($query, $oauth));
$composite_key = rawurlencode($consumer_secret) . '&';
$oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
$oauth['oauth_signature'] = $oauth_signature;
$header = array(
	buildAuthorizationHeader($oauth),
	'X-Yahoo-App-Id: ' . $app_id,
);
$options = array(
	CURLOPT_HTTPHEADER => $header,
	CURLOPT_HEADER => false,
	CURLOPT_URL => $url . '?' . http_build_query($query),
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_SSL_VERIFYPEER => false,
);
$ch = curl_init();
curl_setopt_array($ch, $options);
$response = curl_exec($ch);
curl_close($ch);
$return_data = $response;
print_r($return_data);
?>