const express = require('express')  // Määritetään tapahtumakäsittelijä joka määrittelee sovellukseen tulevia HTTP GET pyyntöjä
const app = express()
const cors = require('cors') // Corssin avulla pystytään sallimaan muista origineista tulevat pyynnör
const morgan = require('morgan')
morgan.token('body', (request, response) => JSON.stringify(request.body)) // Määritellään tokeni BODY ja muutetaan se JSON-muotoon .JSON.stringifyn avulla

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
      },
      {
        "name": "Ada Loveleace",
        "number": "39-44-532532", 
        "id": "2"
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
      }
]

// Tämä täytyy olla koska muuten kaatuu
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()  // Next, siirretään kontrolli seuraavalle middlewarelle
  }

app.use(express.json()) // json-parse a.k.a Middleware, Oltava koska auttaa POST -pyyntöjen käsittelyssä
app.use(requestLogger)  // MIDDLEWARE
app.use(cors())
console.log('-----')
app.use(morgan(':method :url :status :response-time ms :body'))
app.use(express.static('dist')) // Saadaan sivu näyttämään index.html

// Middleware joka luo routejen käsittelemättömistä virhetilanteista JSON-muotoisen virheilmoituksen
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  // INFO
app.get('/info', (request, response) => {   // request sisältää pyynnön tiedot || response pyyntöön vastaus
    response.send(`<p>Phonebook has info for ${persons.length} people <br/>${new Date()}</p>`)            // send lähettää selaimelle tiedot
    console.log(new Date())

})
//  MAIN ADDRESS
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
// SEARCH ID
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id        // params = parametri
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
// POST
app.post('/api/persons', (request, response) => {
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
    const findName = persons.find(name => name.name === body.name)    
    if (findName) {
        return response.status(409).json({
         error: 'name must be unique'
        })
    }
    const generateID = Math.ceil(Math.random()*1000)
    const person = {
        name: body.name,
        number: body.number,
        id: body.id || String(generateID)
    }
    console.log('current persons list')
    console.log(persons)
    persons = persons.concat(person)
    console.log('New persons list')
    console.log(persons)
    response.json(person)
})
// DELETE || poistaa
app.delete('/api/persons/:id', (request, response) => {
    console.log('current persons list')
    console.log(persons)
    const id = request.params.id
    console.log(`deleted id ${id}`)
    persons = persons.filter(person => person.id !== id)
    console.log('New persons list')
    console.log(persons)
    response.status(204).end()      // 204 no content
})
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})