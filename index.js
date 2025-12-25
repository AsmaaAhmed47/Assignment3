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

const server = http.createServer((req, res) => {
  const { method, url } = req;

  //  Q1: CREATE USER 
  if (method === "POST" && url === "/user") {
    let body = "";

    req.on("data", chunk => body += chunk.toString());

    req.on("end", () => {
      try {
        const newUser = JSON.parse(body);
        const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

        if (users.some(u => u.email === newUser.email)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Email already exists" }));
        }

        newUser.id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push(newUser);

        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newUser));
      } catch {
        res.writeHead(400).end("Invalid JSON");
      }
    });

  //  Q2: UPDATE USER 
  } else if (method === "PATCH" && url.startsWith("/user/")) {
    const id = parseInt(url.split("/")[2]);
    let body = "";

    req.on("data", chunk => body += chunk.toString());

    req.on("end", () => {
      try {
        const updatedData = JSON.parse(body);
        const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "User not found" }));
        }

        users[index] = { ...users[index], ...updatedData };
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users[index]));
      } catch {
        res.writeHead(400).end("Invalid JSON");
      }
    });

  //  Q3: DELETE USER 
  } else if (method === "DELETE" && url.startsWith("/user/")) {
    const id = parseInt(url.split("/")[2]);
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "User not found" }));
    }

    const deletedUser = users.splice(index, 1)[0];
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(deletedUser));

  //  Q4: GET ALL USERS 
  } else if (method === "GET" && url === "/user") {
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));

  //  Q5: GET USER BY ID 
  } else if (method === "GET" && url.startsWith("/user/")) {
    const id = parseInt(url.split("/")[2]);
    const users = JSON.parse(fs.readFileSync("users.json", "utf-8") || "[]");

    const user = users.find(u => u.id === id);
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "User not found" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));

  //  NOT FOUND
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


//===============
// Bonus question 

var majorityElement = function(nums) {
    let majorNum = null;
    let count = 0;

    for (let num of nums) {
        if (count === 0) {
            majorNum = num;
        }
        count += (num === majorNum) ? 1 : -1;
    }

    return majorNum;
};

let nums1 = [3, 2, 3];
console.log(majorityElement(nums1));

let nums2 = [2,2,1,1,1,2,2];
console.log(majorityElement(nums2));
