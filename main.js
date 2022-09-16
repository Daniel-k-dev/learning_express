const fs = require('fs');
const template = require('./lib/template.js');
const express = require('express');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const app = express()
const port = 3000

app.get('/', (request, response) => {
  fs.readdir('data/' , function(error, filelist) {
    var title = 'wlcom';
    var description = 'halo';
    var list = template.list(filelist);
    var html = template.HTML(title,list, 
      `<h2>${title}</h2> <p>${description}</p>`,
      `<a href="/create">create</a>`);
    response.send(html);
  })
})

app.get('/page/:pageId', function(request, response) { 
  fs.readdir('./data' , function (error, filelist) {
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(filelist);
      const cleanTitle = sanitizeHtml(title);
      const cleanDescription = sanitizeHtml(description);
      var html = template.HTML(title,list,
        `<h2>${cleanTitle}</h2> <p>${cleanDescription}</p>`, 
        `<a href="/create">create</a> 
        <a href="/update/${cleanTitle}">update</a>
        <form action="/delete_process" method="post">
          <input type="hidden" name="id" value="${cleanTitle}">
          <input type="submit" value="delete">
        </form>
        `);
      response.send(html);
    })
  });
});

app.get('/create', function(request, response) { 
  fs.readdir('data/' , function(error, filelist) {
    var title = 'Create';
    var list = template.list(filelist);
    var html = template.HTML(title,list,`
    <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    `, '');
    response.send(html);
  })
});

app.post('/create_process', function(request, response) { 
  var body = '';
  request.on('data', function(data){
      body += data;
  });
  request.on('end', function () {
    var title = new URLSearchParams(body).get('title');
    console.log(title);
    var description = new URLSearchParams(body).get('description');
    fs.writeFile(`./data/${title}`, description, () => {
      response.writeHead(302, {'Location': `/page/${title}`});
      response.end();
    }); 
  });
});

app.get('/update/:pageId', function(request, response) { 
  const filteredId = path.parse(request.params.pageId).base;
    fs.readdir('data/' , function(error, filelist) {
      fs.readFile(`data/${filteredId}` , `utf-8` , (err , description) => {
        var title = filteredId;
        var list = template.list(filelist);
        var html = template.HTML(title,list,"" , `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );  
        response.send(html)
      })
    })
});

app.post('/update_process', function(request, response) { 
  var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
      var id = new URLSearchParams(body).get('id');
      var title = new URLSearchParams(body).get('title');
      var description = new URLSearchParams(body).get('description');
      const filteredId = path.parse(id).base;
      fs.rename(`data/${filteredId}`, `data/${title}`, function(error){
        fs.writeFile(`./data/${title}`, description, () => {}); 
          response.writeHead(302, {'Location': `/page/${title}`});
          response.end();
      });
    });
});

app.post('/delete_process', function(request, response) { 
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
    const id = new URLSearchParams(body).get('id');
    const filteredId = path.parse(id).base;
    fs.rm(`data/${filteredId}`, () => {
      response.writeHead(302, {'Location': `/`});
      response.end();
    })
  });
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// const http = require('http');
// const fs = require('fs');
// const url = require('url');
// const template = require('./lib/template.js');
// const path = require('path');
// const sanitizeHtml = require('sanitize-html');

// let app = http.createServer(function(request,response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url,true).pathname; 
//     if (pathname === '/') {
//       if (queryData.id === undefined) {
//         fs.readdir('data/' , function(error, filelist) {
//           var title = 'wlcom';
//           var description = 'halo';
//           var list = template.list(filelist);
//           var html = template.HTML(title,list, 
//             `<h2>${title}</h2> <p>${description}</p>`,
//             `<a href="/create">create</a>`);
//           response.writeHead(200);
//           response.end(html);
//         })
//       } 
//       else {
//         const filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//           fs.readdir('data/' , function (error, filelist) {
//             var title = queryData.id;
//             var list = template.list(filelist);
//             const cleanTitle = sanitizeHtml(title);
//             const cleanDescription = sanitizeHtml(description);
//             var html = template.HTML(title,list,
//               `<h2>${cleanTitle}</h2> <p>${cleanDescription}</p>`, 
//               `<a href="/create">create</a> 
//               <a href="/update?id=${cleanTitle}">update</a>
//               <form action="/delete_process" method="post">
//                 <input type="hidden" name="id" value="${cleanTitle}">
//                 <input type="submit" value="delete">
//               </form>
//               `);
//             response.writeHead(200);
//             response.end(html);
//           })
//         });
//       }
//     }
//     else if (pathname === '/create') {
//       fs.readdir('data/' , function(error, filelist) {
//         var title = 'Create';
//         var list = template.list(filelist);
//         var html = template.HTML(title,list,`
//         <form action="/create_process" method="post">
//           <p><input type="text" name="title" placeholder="title"></p>
//           <p>
//             <textarea name="description" placeholder="description"></textarea>
//           </p>
//           <p>
//             <input type="submit">
//           </p>
//         </form>
//         `, '');
//         response.writeHead(200);
//         response.end(html);
//       })
//     }
//     else if(pathname === '/create_process'){
//       let title;
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function () {
//         title = new URLSearchParams(body).get('title');
//         var description = new URLSearchParams(body).get('description');
//         fs.writeFile(`./data/${title}`, description, () => {}); 
//           response.writeHead(302, {'Location': `/?id=${title}`});
//           response.end();
//       });
//     }
//     else if (pathname === '/update') {
//       const filteredId = path.parse(queryData.id).base;
//       fs.readdir('data/' , function(error, filelist) {
//         fs.readFile(`data/${filteredId}` , `utf-8` , (err , description) => {
//           var title = queryData.id;
//           var list = template.list(filelist);
//           var html = template.HTML(title,list,"" , `
//           <form action="/update_process" method="post">
//             <input type="hidden" name="id" value="${title}">
//             <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//             <p>
//               <textarea name="description" placeholder="description">${description}</textarea>
//             </p>
//             <p>
//               <input type="submit">
//             </p>
//           </form>
//           `,
//           `<a href="/create">create</a> <a href="/update?id=${title}">update</a>
//           `);
//           response.writeHead(200);
//           response.end(html);
//         })
//       })
//     }
//     else if (pathname === '/update_process') {
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//         var id = new URLSearchParams(body).get('id');
//         var title = new URLSearchParams(body).get('title');
//         var description = new URLSearchParams(body).get('description');
//         const filteredId = path.parse(id).base;
//         fs.rename(`data/${filteredId}`, `data/${title}`, function(error){
//           fs.writeFile(`./data/${title}`, description, () => {}); 
//             response.writeHead(302, {'Location': `/?id=${title}`});
//             response.end();
//         });
//       });
//     }
//     else if (pathname === '/delete_process') {
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//         const id = new URLSearchParams(body).get('id');
//         const filteredId = path.parse(id).base;
//         fs.rm(`data/${filteredId}`, () => {
//           response.writeHead(302, {'Location': `/`});
//           response.end();
//         })
//       });
//     }
    
//     else {
//       response.writeHead(404);
//       response.end("404 NotFound");
//     }
// });
// app.listen(3000);