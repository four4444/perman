// require Express and Socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = require('./config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.dbURL);

require('./configPassport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'myverybigsecretkey' }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

var visitorsData = {};

app.set('view engine', 'pug');
app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public/')));

require('./routes/routes.js')(app, passport);

io.on('connection', function(socket) {
  if (socket.handshake.headers.host === config.host
  && socket.handshake.headers.referer.indexOf(config.host + config.dashboardEndpoint) > -1) {

    // if someone visits '/dashboard' send them the computed visitor data
    io.emit('updated-stats', computeStats());

  }

  // a user has visited our page - add them to the visitorsData object
  socket.on('visitor-data', function(data) {
    visitorsData[socket.id] = data;

    // compute and send visitor data to the dashboard when a new user visits our page
    io.emit('updated-stats', computeStats());
  });

  socket.on('disconnect', function() {
    // a user has left our page - remove them from the visitorsData object
    delete visitorsData[socket.id];

    // compute and send visitor data to the dashboard when a user leaves our page
    io.emit('updated-stats', computeStats());
  });
});

// wrapper function to compute the stats and return a object with the updated stats
function computeStats(){
  return {
    pages: computePageCounts(),
    referrers: computeRefererCounts(),
    activeUsers: getActiveUsers()
  };
}

// get the total number of users on each page of our site
function computePageCounts() {
  // sample data in pageCounts object:
  // { "/": 13, "/about": 5 }
  var pageCounts = {};
  for (var key in visitorsData) {
    var page = visitorsData[key].page;
    if (page in pageCounts) {
      pageCounts[page]++;
    } else {
      pageCounts[page] = 1;
    }
  }
  return pageCounts;
}

// get the total number of users per referring site
function computeRefererCounts() {
  // sample data in referrerCounts object:
  // { "http://twitter.com/": 3, "http://stackoverflow.com/": 6 }
  var referrerCounts = {};
  for (var key in visitorsData) {
    var referringSite = visitorsData[key].referringSite || '(direct)';
    if (referringSite in referrerCounts) {
      referrerCounts[referringSite]++;
    } else {
      referrerCounts[referringSite] = 1;
    }
  }
  return referrerCounts;
}

// get the total active users on our site
function getActiveUsers() {
  return Object.keys(visitorsData).length;
}

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});
