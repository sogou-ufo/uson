<?php

$name = $_GET['name'];

$arr = array('name'=>$name);


echo json_encode($arr);
?>
