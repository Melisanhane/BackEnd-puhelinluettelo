require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors') 
const morgan = require('morgan')
morgan.token('body', (request) => JSON.stringify(request.body)) 

const Person = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

// MIDDLEWARES
app.use(express.static('dist')) 
app.use(express.json())
app.use(requestLogger)
app.use(cors())
console.log('-----')
app.use(morgan(':method :url :status :response-time ms :body'))

const unknownEndpoint = (request, response,) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

// ERROR HANDLER
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    console.log(error.name)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message})
    }
    next(error)
}

// INFO
app.get('/info', (request, response) => { 
    response.send(`<p>Phonebook has info for ${Person.length} people <br/>${new Date()}</p>`)  
    console.log(new Date())
})

//  MAIN ADDRESS
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// SEARCH ID
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then( person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))

})

// POST
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) { 
        return response.status(400).json({
            error: 'number missing'
        })
    }
    const generateID = Math.ceil(Math.random()*1000)
    const person = new Person ({
        name: body.name,
        number: body.number,
        id: body.id || String(generateID)
    })
    person.save().then(savedPerson => {
        console.log(`${savedPerson.name} saved to MongoDB`)
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then( result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

// UPDATE NUMBER
app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(
    request.params.id, {name, number}, {new: true, runValidators: true, context: 'query'}) 
    .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})