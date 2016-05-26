var express = require("express");
var fs = require('fs');//For file streams
var path = require("path");
var multiparty = require('multiparty');//To access form data and input files
var app = express();
app.use(express.static(path.join(__dirname, '/public')));
//Render index.html
app.get('/index.html', function(request, response) {
    response.render('index.html');
});
//Ajax request to get json data
app.get('/getJSON', function(request, response) {
    var content = JSON.parse(fs.readFileSync("./public/movie.json"));

    response.send(content, null, 4);
});
//Post request to add new movie
app.post('/addMovie', function(request, response) {
    var form = new multiparty.Form();
    //parse form using multiparty module to get files and fields
    form.parse(request, function(err, fields, files) {
        var img = files.image[0];
        //Read input file and store
        fs.readFile(img.path, function(err, data) {
            var path = './public/images/' + fields.title[0] + '.jpg';
            console.log('Writing file...');
            fs.writeFile(path, data, function(error) {})
        });
        //Read Json file to write new object
        var content = JSON.parse(fs.readFileSync("./public/movie.json"));
        var obj = {};
        //Prepare new object
        obj.title = fields.title[0];
        obj.date = fields.date[0];
        obj.director = fields.director[0];
        obj.actors = fields.actors[0];
        obj.about = fields.about[0];
        obj.rating = fields.rating[0];
        obj.wins = fields.wins[0];
        obj.nominations = fields.nominations[0];
        obj.file = 'images/' + fields.title[0] + '.jpg';
        obj.ytlink = fields.ytlink[0];
        //Push to json array
        content.push(obj);
        //Write to file with updated data
        fs.writeFile("./public/movie.json", JSON.stringify(content, null, 4), function(err) {
            if (err) {
                console.log(err);
            }
        });
    });
    //redirect to home page
    response.redirect('/index.html');

});
//To update movie details
app.post('/updateMovie', function(request, response) {


    var form = new multiparty.Form();
    form.parse(request, function(err, fields, files) {
        var img = files.image[0];
        //Keep old file if user not choosen any file
        if (files.image[0].size > 0) {
            fs.readFile(img.path, function(err, data) {
                var path = './public/images/' + fields.title[0] + '.jpg';
                fs.writeFile(path, data, function(error) {})
            });
        }
        var content = JSON.parse(fs.readFileSync("./public/movie.json"));

        for (i = 0; i < content.length; i++) {
          //Find object in JSON array and update values
            if (content[i].title === fields.title[0]) {
                console.log(files.image[0].size);
                content[i].date = fields.date[0];
                content[i].director = fields.director[0];
                content[i].actors = fields.actors[0];
                content[i].about = fields.about[0];
                content[i].rating = fields.rating[0];
                content[i].wins = fields.wins[0];
                content[i].nominations = fields.nominations[0];
                content[i].file = 'images/' + fields.title[0] + '.jpg';
                content[i].ytlink = fields.ytlink[0];
                break;
            }
        }

        fs.writeFile("./public/movie.json", JSON.stringify(content, null, 4), function(err) {
            if (err) {
                console.log(err);
            }
        });
    });
    response.redirect('/index.html');
});
//delete movie from json array
app.get("/deleteMovie", function(request, response) {

    var index = -1;
    var content = JSON.parse(fs.readFileSync("./public/movie.json"));
    for (i = 0; i < content.length; i++) {
      //search for movie
        if (content[i].title === request.param('title')) {
            index = i;
            break;
        }
    }
    //Delete from json array
    content.splice(index, 1);
    fs.writeFile("./public/movie.json", JSON.stringify(content, null, 4), function(err) {
        if (err) {
            console.log(err);
        }
    });
    response.redirect('/index.html');
});
app.listen(8080);
