var fs=require('fs');
var exec=require('child_process').exec;
var http=require('http');
var express=require('express');
var app=express();
var server=http.createServer(app);
var crypto=require('crypto');
var mysql=require('mysql');
var unirest=require('unirest');
var connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'IamBatman',
});
connection.connect(function(err){
    if(err)
    {
	console.log("Error in connecting to MySQL "+err);
	return;
    }
    console.log("Connected to MySQL");
});
var query=connection.query('USE faceAuth',function(err,result){
    if(err)
    {
	console.log("Error in selecting DB "+err);
	return;
    }
    console.log("Database Connection Established");
});
//var io=require('socket.io').listen(server);
var splitter=require('./splitter.js');
app.configure(function(){
    app.use(require('connect').bodyParser());
});
app.get('/',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/index.html',function(err,data){
	if(err)
	{
	    console.log("Error Loading Index "+err);
	    return;
	}
	res.setHeader('Content-Type', 'text/html');
	res.end(data);
    });
});
app.get('/register',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/register.html',function(err,data){
	if(err)
	{
	    console.log("Error Loading Register "+err);
	    return;
	}
	res.setHeader('Content-Type','text/html');
	res.end(data);
    });
});
app.get('/login',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/login.html',function(err,data){
	if(err)
        {
            console.log("Error Loading Login "+err);
            return;
        }
	res.setHeader('Content-Type','text/html');
	res.end(data);
    });
});
app.get('/getPassword.js',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/getPassword.js',function(err,data){
	if(err)
	{
	    console.log("Error Loading getPassword JS"+err);
	    return;
	}
	res.setHeader('Content-Type','application/javascript');
	res.end(data);
});
});
app.get('/snapShot.js',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/snapShot.js',function(err,data){
	if(err)
	{
	    console.log("Error Loading snapShot JS "+err);
	    return;
	}
	res.setHeader('Content-Type','application/javascript');
	res.end(data);
    });
});
app.get('/batman.jpeg',function(req,res){
    console.log(req.url);
    fs.readFile(__dirname+'/batman.jpeg',function(err,data){
	if(err)
	{
	    console.log("Error in Loading batman Image "+err);
	    return;
	}
	res.setHeader('Content-Type','image/jpeg');
	res.end(data);
    });
});
app.post('/getPassword',function(req,res){
    console.log(req.body);
    var name=req.body.userLoginName;
    var fetchUserQuery=connection.query("SELECT * FROM `users` WHERE `name`=?",[name],function(err,results){
	if(err)
	{
	    console.log("Error in Fetching User "+error);
	    return;
	}
	if(results.length>0)
	{
	    var phone=results[0].phone;
	    var date=new Date();
	    var now=date.getSeconds().toString();
	    var hash=crypto.createHash('md5').update(name+phone+now).digest("hex");
	    var Request = unirest.get("https://site2sms.p.mashape.com/index.php?uid=8438121945&pwd=330666&phone="+phone+"&msg="+hash)
		.headers({ 
		    "X-Mashape-Authorization": "hjKGftDlUAZkFZ2ZjWjtMAIjpJu6CVzL"
		})
		.end(function (response) {
		    console.log(response);
		});
	    console.log(hash);
	}
    });
    //req.session.userName=req.body.userLoginName;
    
    res.setHeader('Content-Type','text/plain');
    res.end("Mass");
});
app.post('/registerUser',function(req,res){
    var name=req.body.userRegName;
    var phone=req.body.userRegPhone;
    console.log(phone);
    var imageName="";
    fs.readFile(req.files.userRegImage.path,function(err,data){ 
	imageName=req.files.userRegImage.name;
	if(!imageName) 
	{ 
	    console.log("Error!"); 
	    res.redirect("/"); 
	    res.end(); 
	} 
	else
	{
	    var newPath=__dirname+"/"+imageName;
	    fs.writeFile(newPath,data,function(err){ 
		if(err)
		{
		    console.log("Error in Uploading "+err);
		    return;
		}
		console.log(phone);
		var insertQuery=connection.query("INSERT INTO `users` (`name`,`phone`,`image`) VALUES (?,?,?)",[name,phone,imageName],function(err,result){
		    if(err)
		    {
			console.log(insertQuery.sql);
			console.log("Error in inserting to users table "+err);
			return;
		    }
		    console.log("Inserted");
		    res.redirect("/login");
		});
	    });
	}
    });
});
app.listen(3000);

console.log("Server running at 3000");
