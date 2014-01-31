var fs=require('fs');
var exec=require('child_process').exec;
var http=require('http');
var express=require('express');
var app=express();
var server=http.createServer(app);
var crypto=require('crypto');
var mysql=require('mysql');
var unirest=require('unirest');
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
var connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'root',
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
    req.session=null;
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
app.post('/authenticate',function(req,res){
    console.log(req.url);
    if(req.session.userId && req.session.secret)
    {
	var password=req.body.password;
	var secret=req.session.secret;
	var id=req.session.userId;
	req.session.secret=null;
	if(password==secret)
	{
	    fs.readFile(__dirname+'/home.html',function(err,data){
		if(err)
		{
                    console.log("Error Loading Register "+err);
                    return;
		}
		res.setHeader('Content-Type','text/html');
		res.end(data);
            });
	    /*var data="<html><head><title>Authentication_"+id+"</title></head><body><h1>Products Listing</h1><ul id=\"products\">";
	    var getProducts=connection.query("SELECT * FROM `products`",function(err,results){
		if(err)
		{
		    console.log("Error in fetching Products "+err);
		    return;
		}
		for(var i=0;i<results.length;i++)
		    data+="<ul id="+results[i].id+">"+results[i].name+"&nbsp&nbsp&nbsp&nbsp"+results[i].price+"</ul>";
		data+="</ul>";
		data+="<a href='/signout'>Signout</a></body></html";
		res.setHeader('Content-Type','text/html');
		res.end(data);
	    });*/
	}
	else
	    res.redirect("/login");
    }
});
app.get('/signout',function(req,res){
    if(req.session.userId || req.session.secret)
    {
	req.session.secret=null;
	req.session.userId=null;
	res.redirect("/");
    }
    else
    {
	res.setHeader('Content-Type','text/plain');
	res.end('Forbidden');
    }
	
});
app.get('/register',function(req,res){
    console.log(req.url);
    if(req.session.userId || req.session.secret)
	res.end("You have already Registered!");
    else
    {
	fs.readFile(__dirname+'/register.html',function(err,data){
	    if(err)
	    {
		console.log("Error Loading Register "+err);
		return;
	    }
	    res.setHeader('Content-Type','text/html');
	    res.end(data);
	});
    }
});
app.get('/password',function(req,res){
    if(req.session.userId && req.session.secret)
    {
	fs.readFile(__dirname+'/password.html',function(err,data){
	    if(err)
	    {
		console.log("Error Loading Password "+err);
		return;
	    }
	    res.setHeader('Content-Type','text/html');
	    res.end(data);
	});
    }
    else
    {
	res.setHeader('Content-Type','text/plain');
	res.end("Forbidden!");
    }
});
app.get('/login',function(req,res){
    console.log(req.url);
    if(req.session.userId && !req.session.secret)
	res.end("You have logged in already");
    else if(req.session.userId && req.session.secret)
	res.redirect("/password");
    else
    {
	fs.readFile(__dirname+'/login.html',function(err,data){
	    if(err)
            {
		console.log("Error Loading Login "+err);
		return;
            }
	    res.setHeader('Content-Type','text/html');
	    res.end(data);
	});
    }
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
    if(req.session.userId || req.session.secret)
    {
	req.session=null;
	res.redirect("/");
    }
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
	    var id=results[0].id;
	    var date=new Date();
	    var now=date.getSeconds().toString();
	    var hash=crypto.createHash('md5').update(name+phone+now).digest("hex");
	    console.log(hash);
	    var Request = unirest.get("https://site2sms.p.mashape.com/index.php?uid=8438121945&pwd=330666&phone="+phone+"&msg="+hash)
		.headers({ 
		    "X-Mashape-Authorization": "hjKGftDlUAZkFZ2ZjWjtMAIjpJu6CVzL"
		})
		.end(function (response) {
		    req.session.userId=id;
		    req.session.secret=hash;
		    res.redirect('/password');
		});
	}
	else
	{
	    res.setHeader('Content-Type','text/plain');
	    res.end("Register on the Site First!");
	}
    });
});
app.post('/registerUser',function(req,res){
    if(req.session.userId || req.session.secret)
    {
	req.session=null;
	res.redirect("/");
    }
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
