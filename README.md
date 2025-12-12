# Catan Database - Final Project CPSC-408
**Team Name:** UPDATE grades SET studentGrade = 'A+'; 
**Members:** Bhuvan Balagar, Isaac Browen, Blaise Rettig, Jake Triester
**Emails:** balagar@chapman.edu, browen@chapman.edu, brettig@chapman.edu, triester@chapman.edu

## Source Files
- index.html
- search.html
- add.html
- alter.html
- gameview.html
- code.js
- style.css
- server.php
- database_dump.sql
- README.md
- final_video_demo.mp4

## Application Resources
This project was made with *html*, *js*, *css*, *php*, and *MySQL*. The only runtime dependancy is a local **MySQL** instance for the database and **PHP** for queries.
The application was built with vscode and tested on the Firefox browser. 

## Run Instructions
After installing MySQL and adding the database dump make sure that the same username and password used to log into the database is updated in the application code.

**IMPORTANT!** You must change the following code on **line 15** of the `server.php` file to your MySQL login info and schema name.
```php
$conn = new mysqli("localhost", "root", "CPSC408!", "CatanTest");
//$conn = new mysqli(<host_name>, <username>, <password>, <database_schema_name>);
```

To run the application start a PHP localhost server (for me the command was `php -S localhost:8000`) and then click the link that it creates

## (Possible) Issues
*errors can be seen in the browser debug view (ctr+shift+i)*
- If `mysqli` cannot be found you might be missing some requirements
- Images might not appear (don't know what causes this error)

