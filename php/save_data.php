<?php 
include_once "config.php";

$type = $_POST['type'];
$name = $_POST['name'];
$geom = $_POST['geom'];

// echo $name;

// print_r($_POST);

$insert_query = "INSERT INTO public.\"drawn_features\" (type, name, geometry) VALUES ('$type', '$name', ST_GeomFromGeoJSON('$geom'))";

$query = pg_query($db_conn, $insert_query);

if($query){
    json_encode(array("statusCode"=>200));
    // echo "added successfully";
}else{
    echo json_encode(array("statusCode"=>201));
    // echo "insert error!";
}
?>