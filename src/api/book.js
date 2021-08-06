const express = require('express');
const monk = require('monk'); 
const Joi = require('@hapi/joi');

const db = monk('mongodb+srv://learnmongo:learnmongo@cluster0.ot2bp.mongodb.net/library'); 
const books = db.get('books');

const schema = Joi.object({
    title: Joi.string().trim().required(),
    type: Joi.string().trim().required(),
    info: Joi.string().valid('unavailable', 'available'),
});

const router = express.Router();


//READ ALL  
router.get('/', async (req, res, next) => {
    try {
        const items = await books.find({}); 

        res.json(items);
    } catch (error) {
        next(error);
    }
});

//READ ONE  
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = await req.params;

        const data = await books.findOne({ 
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
        const insert = await books.insert(data); 
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

        const item = await books.findOne({
            _id: id
        });

        if(!item) return next();

        await books.update({
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

        await books.remove({_id: id});

        res.json({
            message: "delete success",
            status: 200,
        })
    } catch (error) {
        next(error);
    }
});

module.exports = router;