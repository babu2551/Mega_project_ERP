import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, '')
    },
    filename: function (req, file, cb){
        // Todo: for users
        // const uniqueSuffix = Date.now() + '-' + Math.round
        // (Math.random() * 1E9)
        cb(null, file.orginalname)
    }
})

export const upload = multer({
    storage
})