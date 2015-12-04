<?php
	$imageUrl = empty($_GET["imageUrl"]) ? "image/No_Image_Available.png" : $_GET["imageUrl"];
	$title = $_GET["title"];
	$location = $_GET["location"];
	$uploadDate = empty($_GET["imageUploadDate"]) ? "N/A" : $_GET["imageUploadDate"];
	$category = $_GET["category"];
	$price = $_GET["price"];
	$description = $_GET["description"];
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Details</title>
        <link rel="stylesheet" href="css/details_style.css">
    </head>
    <body>
        <div class="outline">
            <h1>Ad Details</h1>
            <img src="<?php echo $imageUrl; ?>">
            <br /><hr />
            <span>Title: <?php echo $title; ?></span>
            <br /><hr />
            <span>Location: <?php echo $location; ?></span>
            <br /><hr />
            <span>UploadDate: <?php echo $uploadDate; ?></span>
            <br /><hr />
            <span>Category: <?php echo $category; ?></span>
            <br /><hr />
            <span>Price: <?php echo $price; ?></span>
            <br /><hr />
            <span>Description: <?php echo $description; ?></span>
        </div>
    </body>
</html>