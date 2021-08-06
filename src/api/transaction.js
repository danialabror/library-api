const express = require('express');
const monk = require('monk'); //plugin for connect to database
const Joi = require('@hapi/joi');

var moment = require('moment');  

const db = monk('mongodb+srv://learnmongo:learnmongo@cluster0.ot2bp.mongodb.net/library'); //cluster and database link

const students = db.get('students'); //for access database
const books = db.get('books'); //for access database
const transactions = db.get('transaction');

const schema = Joi.object({
    student_id: Joi.string().trim().required(),
    book_id: Joi.string().trim().required(),
    date: Joi.date().raw().required(),  
    return_date: Joi.date(),  
    return: Joi.string().valid('notyet', 'yes'),
    charge: Joi.string(),
});

const router = express.Router();


//READ ALL  
router.get('/', async (req, res, next) => {
    try {
        const items = await transactions.find({}); 

        res.json(items);
    } catch (error) {
        next(error);
    }
});

//READ ONE  
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = await req.params;

        const data = await transactions.findOne({ 
            _id: id,
        });

        const book = await books.findOne({ 
            _id: data.book_id,
        });

        const student = await students.findOne({ 
            _id: data.student_id,
        });

        if(!data) return next(); 

        return res.json({
            "_id": data._id,
            "student": student,
            "book": book,
            "date": data.date,
            "return": data.return
        }); 
    } catch (error) {
        next(error);
    }
});

//Borrowing book  
router.post('/borrow', async (req, res, next) => {
    try {
        const checkbook = await books.findOne({ 
            _id: req.body.book_id,
        });

        const checkstudent = await students.findOne({ 
            _id: req.body.student_id,
        });

        if (checkbook.info == "available") {
            const items = {
                "student_id": req.body.student_id,
                "book_id": req.body.book_id,
                "date": moment().format('MM/DD/YYYY'),
                "return": "notyet"
            }
    
            const data = await schema.validateAsync(items);
            const insert = await transactions.insert(data); 
    
            const bookupdate = {
                "title": checkbook.title,
                "type": checkbook.type,
                "info": "unavailable"
            }
    
            await books.update({
                _id: checkbook._id,
            }, {
                $set: bookupdate
            });
    
            res.json({
                "_id": insert._id,
                "student": checkstudent,
                "book": checkbook,
                "date": insert.date,
                "return": insert.return
            });     

        }else{
            throw new TypeError("Buku sedang dipinjam orang lain");
        }
    } catch (error) {
        next(error);
    }
});

//Returning book
router.post('/return/:book_id', async (req, res, next) => {
    try {
        const { book_id } = await req.params;

        const trans_data = await transactions.findOne({ 
            book_id: book_id,
            return: "notyet"
        });

        const bookdata = await books.findOne({ 
            _id: trans_data.book_id,
        });

        const studentdata = await students.findOne({ 
            _id: trans_data.student_id,
        });

        if(!trans_data) return next();

        const items = {
            "student_id": trans_data.student_id,
            "book_id": trans_data.book_id,
            "date": trans_data.date,
            "return_date": moment().format('MM/DD/YYYY'),
            "return": "yes",
            "charge": "Rp."+ parseInt((new Date(trans_data.date) - new Date(moment().format('MM/DD/YYYY'))) / (1000 * 60 * 60 * 24))
        }

        await transactions.update({
            _id: trans_data._id,
        }, {
            $set: items
        });

        await books.update({
            _id: bookdata._id,
        }, {
            $set: {
                "title": bookdata.title,
                "type": bookdata.type,
                "info": "available",
            }
        });

        res.json({
            "student": studentdata,
            "book": bookdata,
            "borrow_date": items.date,
            "return_date": items.return_date,
            "return": items.return,
            "charge": items.charge
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;