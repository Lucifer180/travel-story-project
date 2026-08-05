const bcrypt=require("bcrypt");
const express=require("express");
//load .env from this folder regardless of where the server is launched from
require("dotenv").config({path:require("path").join(__dirname,".env")});
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
const crypto=require("crypto");
const Anthropic=require("@anthropic-ai/sdk");
//AI client is optional:routes return 503 if no ANTHROPIC_API_KEY is set
const anthropic=process.env.ANTHROPIC_API_KEY?new Anthropic():null;
mongoose.connect(process.env.MONGODB_URI||config.connectionString)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

const User=require("./models/user_model");
const {authenticateToken}  = require("./utilities");
// const travelStoryModel = require("./models/travelStory-model");
app.post("/create-account",async(req,res)=>{
    const {fullName,email,password}=req.body;
    if(!fullName||!email||!password){
        return res.status(400).json({error:true,message:"All fields are required"});
    }
   
    const isUser=await User.findOne({email});
    if(isUser){
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
        user:{fullName:user.fullName,email:user.email},
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
            return res.status(400).json({ error: true, message: "Invalid credentials" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: true, message: "Invalid credentials" });
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
app.post("/image-upload",authenticateToken,upload.single("image"),async (req,res)=>{
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
app.delete('/delete-image',authenticateToken,async (req,res)=>{
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
  res.status(500).json({error:true,message:err.message});
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

        // Remove the image file if it exists; the story is already gone either way
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image:", err.message);
            }
        });

        res.status(200).json({ message: "Travel story deleted successfully" });

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
  
//sharing:generate a public link for a story
app.post("/stories/:id/share",authenticateToken,async(req,res)=>{
    const {id}=req.params;
    const {userId}=req.user;
    try{
        const travelStory=await TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }
        if(!travelStory.shareId){
            travelStory.shareId=crypto.randomBytes(12).toString("hex");
            await travelStory.save();
        }
        res.status(200).json({error:false,shareId:travelStory.shareId,message:"Story is now shareable"});
    }
    catch(err){
        res.status(500).json({error:true,message:err.message});
    }
});
app.delete("/stories/:id/share",authenticateToken,async(req,res)=>{
    const {id}=req.params;
    const {userId}=req.user;
    try{
        const travelStory=await TravelStory.findOne({_id:id,userId:userId});
        if(!travelStory){
            return res.status(404).json({error:true,message:"Travel story not found"});
        }
        travelStory.shareId=null;
        await travelStory.save();
        res.status(200).json({error:false,message:"Sharing disabled"});
    }
    catch(err){
        res.status(500).json({error:true,message:err.message});
    }
});
//public read-only view,no auth required
app.get("/shared/:shareId",async(req,res)=>{
    const {shareId}=req.params;
    try{
        const travelStory=await TravelStory.findOne({shareId}).select("-userId");
        if(!travelStory){
            return res.status(404).json({error:true,message:"This story is not shared or the link is invalid"});
        }
        res.status(200).json({story:travelStory});
    }
    catch(err){
        res.status(500).json({error:true,message:err.message});
    }
});
app.put("/update-profile",authenticateToken,async(req,res)=>{
    const {fullName}=req.body;
    const {userId}=req.user;
    if(!fullName||!fullName.trim()){
        return res.status(400).json({error:true,message:"Full name is required"});
    }
    try{
        const user=await User.findByIdAndUpdate(userId,{fullName:fullName.trim()},{new:true});
        if(!user){
            return res.sendStatus(401);
        }
        res.status(200).json({error:false,user:{fullName:user.fullName,email:user.email},message:"Profile updated successfully"});
    }
    catch(err){
        res.status(500).json({error:true,message:err.message});
    }
});
app.put("/change-password",authenticateToken,async(req,res)=>{
    const {currentPassword,newPassword}=req.body;
    const {userId}=req.user;
    if(!currentPassword||!newPassword){
        return res.status(400).json({error:true,message:"Current and new password are required"});
    }
    if(newPassword.length<6){
        return res.status(400).json({error:true,message:"New password must be at least 6 characters"});
    }
    try{
        const user=await User.findById(userId);
        if(!user){
            return res.sendStatus(401);
        }
        const isPasswordValid=await bcrypt.compare(currentPassword,user.password);
        if(!isPasswordValid){
            return res.status(400).json({error:true,message:"Current password is incorrect"});
        }
        user.password=await bcrypt.hash(newPassword,10);
        await user.save();
        res.status(200).json({error:false,message:"Password changed successfully"});
    }
    catch(err){
        res.status(500).json({error:true,message:err.message});
    }
});
//surface actionable Anthropic API failures (bad key, no credit, rate limit)
//instead of a generic message that hides the real cause
function describeAiError(err,fallback){
    const upstream=err?.error?.error?.message;
    if(err?.status===401)return "Invalid ANTHROPIC_API_KEY. Check the key in backend/.env";
    if(err?.status===429)return "Anthropic API rate limit reached. Try again shortly.";
    if(upstream)return upstream;
    return fallback;
}
//AI:suggest new destinations based on the user's travel history
app.get("/ai/travel-suggestions",authenticateToken,async(req,res)=>{
    if(!anthropic){
        return res.status(503).json({error:true,message:"AI features are not configured. Add ANTHROPIC_API_KEY to backend/.env"});
    }
    const {userId}=req.user;
    try{
        const stories=await TravelStory.find({userId}).sort({visitedDate:-1}).limit(30);
        if(stories.length===0){
            return res.status(400).json({error:true,message:"Add a few travel stories first so the AI has something to work with"});
        }
        const history=stories.map(s=>({
            title:s.title,
            locations:s.visitedLocation,
            visitedDate:s.visitedDate,
            excerpt:s.story.slice(0,300),
        }));
        const response=await anthropic.messages.create({
            model:"claude-opus-5",
            max_tokens:2048,
            system:"You are a travel advisor inside a personal travel journal app. Based on the user's past trips, suggest new destinations they would love. Suggest places they have NOT already visited. Ground each suggestion in their history (e.g. they seem to enjoy beaches, mountains, cities).",
            messages:[{role:"user",content:`Here are my past trips as JSON:\n${JSON.stringify(history)}\n\nSuggest 4 new destinations for me.`}],
            output_config:{
                format:{
                    type:"json_schema",
                    schema:{
                        type:"object",
                        properties:{
                            suggestions:{
                                type:"array",
                                items:{
                                    type:"object",
                                    properties:{
                                        destination:{type:"string"},
                                        country:{type:"string"},
                                        reason:{type:"string",description:"Why this fits the user, referencing their past trips"},
                                        bestTime:{type:"string",description:"Best season/months to visit"}
                                    },
                                    required:["destination","country","reason","bestTime"],
                                    additionalProperties:false
                                }
                            }
                        },
                        required:["suggestions"],
                        additionalProperties:false
                    }
                }
            }
        });
        if(response.stop_reason==="refusal"){
            return res.status(500).json({error:true,message:"The AI declined this request. Please try again."});
        }
        const text=response.content.find(b=>b.type==="text")?.text||"{}";
        const parsed=JSON.parse(text);
        res.status(200).json({suggestions:parsed.suggestions||[]});
    }
    catch(err){
        console.error("AI suggestion error:",err);
        res.status(500).json({error:true,message:describeAiError(err,"Failed to generate suggestions")});
    }
});
//AI:polish/improve the writing of a story draft
app.post("/ai/polish-story",authenticateToken,async(req,res)=>{
    if(!anthropic){
        return res.status(503).json({error:true,message:"AI features are not configured. Add ANTHROPIC_API_KEY to backend/.env"});
    }
    const {story,title}=req.body;
    if(!story||!story.trim()){
        return res.status(400).json({error:true,message:"Story text is required"});
    }
    try{
        const response=await anthropic.messages.create({
            model:"claude-opus-5",
            max_tokens:4096,
            system:"You polish travel journal entries. Improve grammar, flow, and vividness while keeping the writer's voice, facts, and first-person perspective. Keep roughly the same length. Return ONLY the polished story text, no preamble or commentary.",
            messages:[{role:"user",content:`Title: ${title||"(untitled)"}\n\nStory:\n${story}`}],
        });
        if(response.stop_reason==="refusal"){
            return res.status(500).json({error:true,message:"The AI declined this request. Please try again."});
        }
        const polished=response.content.find(b=>b.type==="text")?.text||"";
        res.status(200).json({polished});
    }
    catch(err){
        console.error("AI polish error:",err);
        res.status(500).json({error:true,message:describeAiError(err,"Failed to polish story")});
    }
});
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/assets",express.static(path.join(__dirname,"assets")));
//must match BASE_URL in frontend/src/utils/constants.js
const PORT=process.env.PORT||8000;
app.listen(PORT,()=>{
    console.log(`Server listening on http://localhost:${PORT}`)
});
module.exports=app;