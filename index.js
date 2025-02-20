const express=require('express');
const path = require('path');
const imageroutes=require('./routes/imageRoutes')

const app=express();
const port=process.env.PORT || 3000;
app.use('/uploads/output_images', express.static(path.join(__dirname, 'uploads/output_images')));

app.use('/api/images',imageroutes);

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})

