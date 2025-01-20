const bcrypt=require("bcrypt");
const express=require("express");
require("dotenv").config();
const config=require("./config.json");
const mongoose=require('mongoose');
const cors=require("cors");
const jwt=require("jsonwebtoken");
const TravelStory=require("./models/travelStory-model");
const app=express();
app.use(express.json());
app.use(cors({origin:"*"}));
const upload=require("./multer");
const fs=require("fs");
const path=require("path");
mongoose.connect(config.connectionString)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

const User=require("./models/user_model");
const {authenticateToken}  = require("./utilities");
const travelStoryModel = require("./models/travelStory-model");
app.post("/create-account",async(req,res)=>{
    const {fullName,email,password}=req.body;
    if(!fullName||!email||!password){
        return res.status(400).json({error:true,message:"All fields are required"});
    }
   
    const isName=await User.findOne({fullName,email});
    if(isName){
        return res.status(400).json({error:true,message:"user already exists"});
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=new User({
        fullName,email,password:hashedPassword
    });
    await user.save();
    const accessToken=jwt.sign(
        {
            userId:user._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"72h",
        }
    );
    return res.status(201).json({
        error:false,
        user:{fullName:user.fullName,email:user.email,accessToken:user.accessToken},
        accessToken,
        message:"registration Successfull",
    })
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate access token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "72h" }
        );
        return res.status(200).json({
            error: false,
            message: "Login successful",
            user: { fullName: user.fullName, email: user.email },
            accessToken
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});
app.get("/get-user",authenticateToken,async (req, res) => {
   const {userId}=req.user;

    const isUser = await User.findOne( {_id:userId});

    if (!isUser) { 
        return res.sendStatus(401); 
    }

    return res.json({ 
        user: isUser,
        message: "",
    });
});
app.post('/add-travel-story',authenticateToken,async (req,res)=>
    {
   const {title,story,visitedLocation,imageUrl,visitedDate}=req.body;
   const {userId}=req.user;
   //validating required fields
   if(!title||!story||!visitedLocation||!visitedDate||!imageUrl){
    return res.status(400).json({error:true,message:"all fields are required"});
   }
   //converting the visited dates from milliseconfs to Date object
   const parsedVisitedDate=new Date(parseInt(visitedDate));
   try{
    const travelStory=new TravelStory({
        title,story,visitedLocation,userId,imageUrl,visitedDate:parsedVisitedDate
    });
    await travelStory.save();
    res.status(201).json({story:travelStory,message:"Added Successfully"});
   }
   catch(err){
    res.status(400).json({error:true,message:err.message});
   }
});

app.get("/get-all-stories",authenticateToken,async(req,res)=>{
const {userId}=req.user;
try{
    const travelStories=await TravelStory.find({userId:userId}).sort({isFavourite:-1});
    res.status(200).json({stories:travelStories});
}
catch(err){
  res.status(500).json({error:true,message:err.message});
}
});
app.post("/image-upload",upload.single("image"),async (req,res)=>{
     try{
        if(req.file){
        const imageUrl=`http://localhost:8000/uploads/${req.file.filename}`;
            res.status(200).json({imageUrl});
        }
        else{
            const placeHolderImgUrl=`http://localhost:8000/assets/placeholder.png`;
            res.status(200).json({placeHolderImgUrl});
        }
     }
     catch(err){
        res.status(500).json({error:true,message:err.message});
     }
})
app.delete('/delete-image',async (req,res)=>{
    const {imageUrl}=req.query;
    if(!imageUrl){
        return res.status(401).json({error:true,message:"No image url provided"});
    }
    try{
        const fileName=path.basename(imageUrl);
        const filePath=path.join(__dirname,'uploads',fileName);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            res.status(200).json({error:false,message:"Image deleted successfully"});
        }
        else{
            res.status(404).json({message:"Image not found",error:true});
        }
    }
    catch(error){
        res.status(500).json({error:true,message:error.message});
    }
});
app.put("/edit-story/:id",authenticateToken,async(req,res)=>{
      const {id}=req.params;
      const {title,story,visitedLocation,imageUrl,visitedDate}=req.body;
      const {userId}=req.user;

      if(!title||!story||!visitedLocation||!visitedDate){
        return res.status(400).json({error:true,message:"All fields are required"});
      }
      const parsedVisitedDate=new Date(parseInt(visitedDate));
      try{
         const travelStory=await TravelStory.findOne({_id:id,userId:userId});
         if(!travelStory){
            return res.status(404).json({error:true,message:"travel story not found"});
         }
         const placeHolderImgUrl=`http://localhost:8000/assets/placeholder.png`
         travelStory.title=title;
         travelStory.story=story;
         travelStory.visitedLocation=visitedLocation;
         travelStory.imageUrl=imageUrl||placeHolderImgUrl;
         travelStory.visitedDate=parsedVisitedDate;
         await travelStory.save();
         res.status(200).json({story:travelStory,message:"updateSuccessfull"});

      }
      catch(err){
  res.status(500).json({error:true,message:error.message});
      }
});
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel Story not found" });
        }

        // Delete the travel story
        await travelStory.deleteOne();

        const imageUrl = travelStory.imageUrl;
        const fileName = path.basename(imageUrl);
        const filePath = path.join(__dirname, "uploads", fileName);

        // Delete the image file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err); // Log the error for debugging
                return res.status(400).json({ error: true, message: `Failed to delete image: ${err.message}` });
            }

            // Send success response after image deletion
            res.status(200).json({ message: "Travel story deleted successfully" });
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});

app.put('/update-is-favourite/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { isFavourite } = req.body; // Changed from req.user to req.body
    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        travelStory.isFavourite = isFavourite;
        await travelStory.save();

        res.status(200).json({story:travelStory,message:"update Successful"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get("/search",authenticateToken,async (req,res)=>{
    const {query}=req.query;
    const {userId}=req.user;
    if(!query){
        return res.status(400).json({error:true,message:"query is required"});
    }
    try {
        const SearchResults=await TravelStory.find({
            userId:userId,
            $or:[
                {title:{$regex:query,$options:"i"}},
                {story:{$regex:query,$options:"i"}},
                {visitedLocation:{$regex:query,$options:"i"}}
            ],
        }).sort({isFavourite:-1});
        res.status(200).json({stories:SearchResults});
    } catch (error) {
        res.status(500).json({error:true,message:error.message});
    }
});
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;
  
    try {
      // Validate input
      if (!startDate || !endDate) {
        return res.status(400).json({ error: true, message: "Start date and end date are required." });
      }
  
      const start = new Date(parseInt(startDate));
      const end = new Date(parseInt(endDate));
  
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: true, message: "Invalid date format." });
      }
  
      const filteredStories = await TravelStory.find({
        userId: userId,
        visitedDate: { $gte: start, $lte: end },
      }).sort({ isFavourite: -1 });
  
      res.status(200).json({ stories: filteredStories });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ error: true, message: "An unexpected error occurred. Please try again." });
    }
  });
  
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/assets",express.static(path.join(__dirname,"assets")));
app.listen(8000,()=>{
    console.log("the port is working")
});
module.exports=app;