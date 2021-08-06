const express = require('express');
const monk = require('monk'); //plugin for connect to database
const Joi = require('@hapi/joi');

const db = monk('mongodb+srv://learnmongo:learnmongo@cluster0.ot2bp.mongodb.net/library'); //cluster and database link
const students = db.get('students'); //for access database

const schema = Joi.object({
    name: Joi.string().trim().required(),
    class: Joi.string().trim().required(),
});

const router = express.Router();


//READ ALL  
router.get('/', async (req, res, next) => {
    try {
        const items = await students.find({}); 

        res.json(items);
    } catch (error) {
        next(error);
    }
});

//READ ONE  
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = await req.params;

        const data = await students.findOne({ 
            _id: id,
        });

        if(!data) return next(); 

        return res.json(data); 
    } catch (error) {
        next(error);
    }
});

//CREATE ONE  
router.post('/', async (req, res, next) => {
    try {
        console.log(req.body); 
        const data = await schema.validateAsync(req.body);
        const insert = await students.insert(data); 
        res.json(insert); 
    } catch (error) {
        next(error);
    }
});

//UPDATE ONE  
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = await req.params;

        const data = await schema.validateAsync(req.body); 

        const item = await students.findOne({
            _id: id
        });

        if(!item) return next();

        await students.update({
            _id: id,
        }, {
            $set: data
        });

        res.json(data);
    } catch (error) {
        next(error);
    }
});

//DELETE ONE
router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = await req.params;

        await students.remove({_id: id});

        res.json({
            message: "delete success",
            status: 200,
        })
    } catch (error) {
        next(error);
    }
});

module.exports = router;