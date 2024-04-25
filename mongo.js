const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]    // Kysytään salasana joka annettu Mongo Atlaksissa || node mongo.js (salasana) komentoriville
const contactName = process.argv[3]
const contactNumber = process.argv[4]

const url =
  `mongodb+srv://Melisanhane:${password}@cluster0.surrqt6.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Skeema
const contactSchema = new mongoose.Schema({ // contactSchema kertoo miten person oliot tallennetaan tietokantaan
  name: String,
  number: String,
})

// Model joka määrittelee miten kokoelmat tallennetaan (Person mutta MonGoose muuttaa sen People)
const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 5) {
// Olion luominen joka vastaa modelia
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4],
  })
// Tallennetaan olio tietokantaan ja suljetaan tietokantayhteys
  contact.save().then(result => {
    console.log(`added ${contact.name} number ${contact.number} to phonebook`)
    mongoose.connection.close() // Täytyy olla AINA koska ohjelma ei muuten lopu
  })
}
else if (process.argv.length === 3) { // Client must be connected before running operations
  Contact.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    // Tähän ei sulkua koska muuten ei osaa hakea tietoja
  })
}


/*
 node mongo.js yourpassword Anna 040-1234556 || lisää uuden tiedon tietokantaan ja tulostaa 
 added Anna number 040-1234556 to phonebook

 node mongo.js yourpassword || tulostaa tietokannassa olevat numerotiedot

 KOKOELMAN NIMI ON PEOPLE KOSKA MONGOOSE
 */