const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {type: String, minlength: 3},
  number: {type: String, minlength: 8, validate: {
    validator: function(v) {
      return /^\d{2}-\d{6,}$|^\d{3}-\d{5,}$/g.test(v)
    },
    message: props => `${props.value} is not a valid phone number`
  }, 
    required: true,
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Contact', contactSchema) 