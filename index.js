const { error } = require('node:console');
const fs = require('node:fs');
const http = require('node:http');
const { json } = require('node:stream/consumers');
const port = 3000;

// part one  
// q1)
const ReadableStream1 = fs.createReadStream("./big.txt" , {encoding:'utf-8'});
ReadableStream1.on("data", (chunk)=>{

console.log("New Chunk");
console.log(chunk);
});

ReadableStream1.on("end" ,()=> {
    console.log("Reading is finished");}
);

ReadableStream1.on("error", (err)=>{
console.error("Error",err);
});

//=========================
//q2)

const ReadableStream2 = fs.createReadStream("./source.txt" , {encoding:'utf-8'});
const writablestream1 = fs.createWriteStream("./dest.txt");

ReadableStream2.pipe(writablestream1);

writablestream1.on("finish", ()=>{
console.log("File copied using streams!");}
);

ReadableStream2.on("error", (err)=>{
    console.error("Error reading source file:" , err); 
})

writablestream1.on("error", (err)=>{
    console.error("Error writing destination file :" , err);
})

//============
//q3)

const zlib = require('zlib');
const gzip = zlib.createGzip();


const  ReadableStream3 = fs.createReadStream("./data.txt", {encoding:'utf-8'});
const writablestream2 = fs.createWriteStream("./data.txt.gz");

ReadableStream3.pipe(gzip).pipe(writablestream2);

writablestream2.on("finish", ()=>{
    console.log("File has been compressed!");
});

ReadableStream3.on("error", (err) => {
  console.error("Error reading file:", err);
});

writablestream2.on("error", (err) => {
  console.error("Error writing compressed file:", err);
});

gzip.on("error" , (err)=>{
    console.error("Error during compression:", err);
})

//===============
//part2 
//q1)



const server1 = http.createServer((req, res) => {
  const {method , url} = req;
  if (method === "POST" && url === "/user") {
    let body = "";

    req.on("data", chunk => body += chunk.toString());

    req.on("end", () => {
      try {
        const newUser = JSON.parse(body);

        fs.readFile("users.json", "utf-8", (err, data) => {
          if (err) return res.writeHead(500).end("Error reading file");

          const users = JSON.parse(data || "[]");

       
          if (users.some(u => u.email === newUser.email)) {
            return res.writeHead(400, { "Content-Type": "application/json" })
                      .end(JSON.stringify({ message: "Email already exists" }));
          }

          newUser.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
          users.push(newUser);

          fs.writeFile("users.json", JSON.stringify(users, null, 2), err => {
            if (err) return res.writeHead(500).end("Error writing file");

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newUser));
          });
        });

      } catch (err) {
        res.writeHead(400).end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(404).end("Route not found");
  }
});

server1.listen(port, () => console.log(`Server running at http://localhost:${port}`));

//==============
//q2)


const server2 = http.createServer((req, res) => {
  const {method , url} = req;
  if (method === "PATCH" && url.startsWith("/user/")) {
    const id = parseInt(req.url.split("/")[2]); 
    let body = "";

    req.on("data", chunk => body += chunk.toString());

    req.on("end", () => {
      try {
        const updatedData = JSON.parse(body); 

        const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "User not found" }));
        }

        users[userIndex] = { ...users[userIndex], ...updatedData };

        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users[userIndex]));

      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server2.listen(port, () => console.log(`Server running at http://localhost:${port}`));

//===================
//q3)



const server3 = http.createServer((req, res) => {


  if (req.method === "DELETE" && req.url.startsWith("/user/")) {
    const id = parseInt(req.url.split("/")[2]); 
    try {
     
      const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

 
      const userIndex = users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "User not found" }));
      }

   
      const deletedUser = users.splice(userIndex, 1)[0];

    
      fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

 
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(deletedUser));

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Error reading/writing file" }));
    }

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }

});

server3.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// ==================
// q4)

  const server4 = http.createServer((req ,res)=>{
    const {method , url}= req;
    if (method==="GET"&& url==="/user"){
        try{
         const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");
        res.writeHead(200 , {"content-type":"application/json"});
        res.end(JSON.stringify(users))
    }
    catch (err){
         res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Error reading file" }));
    }
    }
  })
  server4.listen(port, () => console.log(`Server running at http://localhost:${port}`));

//=====================
//q5)


const server5 = http.createServer((req, res) => {


  if (req.method === "GET" && req.url.startsWith("/user/")) {
    const id = parseInt(req.url.split("/")[2]); 

    try {
   
      const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

    
      const user = users.find(u => u.id === id);

      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "User not found" }));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Error reading file" }));
    }

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }

});

server5.listen(port, () => console.log(`Server running at http://localhost:${port}`));


